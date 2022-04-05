import {track, trigger} from "./effect";
import {reactive, ReactiveFlags, readonly} from "./reactive";
import {extend, isObject} from "../shared";

const createGetter = (isReadonly = false,isShallow = false) =>{
    return  function get(target: any, key: string | symbol, receiver: any): any {
        // 根据参数确定是否为readonly
        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadonly
        }
        if(key === ReactiveFlags.IS_READONLY){
            return isReadonly
        }
        const res = Reflect.get(target,key)
        // readonly 只能读，不会set 不trigger 也就不需要 track
        if(!isReadonly){
            // 依赖收集
            track(target,key)
        }
        // shallowReadonly 或 shallowReactive 都直接返回
        if(isShallow){
            return res
        }
        // 处理存在子对象获子数组情况，递归调用
        // 深readonly和深reactive
        if(isObject(res)){
            return isReadonly ? readonly(res) : reactive(res)
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
const shallowReadonlyGetter = createGetter(true,true)
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
export const shallowReadonlyHandlers = extend({},readonlyHandlers,{
    get:shallowReadonlyGetter,
})