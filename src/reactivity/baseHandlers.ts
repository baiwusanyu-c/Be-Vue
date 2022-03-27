import {track, trigger} from "./effect";
import {ReactiveFlags} from "./reactive";

const createGetter = (isReadonly = false) =>{
    return  function get(target: any, key: string | symbol, receiver: any): any {
        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadonly
        }
        if(key === ReactiveFlags.IS_READONLY){
            return isReadonly
        }
        const res = Reflect.get(target,key)
        if(!isReadonly){
            // 依赖收集
            track(target,key)
        }
        return res
    }
}
const createSetter = () =>{
    return function set(target: any, key: string | symbol, value: any, receiver: any): boolean {

        const res = Reflect.set(target,key,value)
        // 派发通知
        trigger(target,key,value)
        return true
    }
}
const get = createGetter()
const set = createSetter()
const readonlyGetter = createGetter(true)
export const mutableHandlers = {
    get,
    set
}
export const readonlyHandlers = {
    get:readonlyGetter,
    set(target: any, key: string | symbol, value: any, receiver: any): boolean {
        console.warn('readonlyHandlers')
        return true
    }
}