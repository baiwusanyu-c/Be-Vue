import {isTracking, trackEffects, triggerEffects} from "./effect";
import {hasChanged, isObject} from "../shared";
import {reactive} from "./reactive";


class refImpl {
    private _value:any
    private _rawValue:any
    public dep = new Set()
    public __v_isRef = true
    constructor(value:any) {
        this._value = convert(value)
        this._rawValue = this._value
    }
    get value(){
        if(isTracking()){
            // 依赖收集
            trackEffects(this.dep)
        }
        return this._value
    }
    set value(newValue:any){
        if(hasChanged(this._rawValue,newValue)) {
            this._value = convert(newValue)
            this._rawValue = this._value
            // 派发更新
            triggerEffects(this.dep)
        }
    }
}
export const convert = (value:any) =>{
    return isObject(value) ? reactive(value) : value
}
export function ref(raw:any){
    return new refImpl(raw)
}
export function isRef(ref:any){
    return !!ref.__v_isRef
}
export function unRef(ref:any){
    return isRef(ref) ? ref.value : ref
}
export function proxyRefs(rawWithRefs:any){
    return new Proxy(rawWithRefs,{
        get(target: any, key: string | symbol): any {
            // 当访问的值是ref对象，返回.value，否则直接返回
            const res = Reflect.get(target,key)
            return isRef(res) ? res.value : res
        },
        set(target: any, key: string | symbol, value: any, receiver: any): boolean {
            // 当设置的值是ref，且新值不是ref
            let targetVal = Reflect.get(target,key)
            if(isRef(targetVal) && !isRef(value)){
                targetVal.value = value
            }else{
                targetVal = value
            }
            return true
        }
    })
}