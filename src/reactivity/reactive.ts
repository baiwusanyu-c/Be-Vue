import {mutableHandlers, readonlyHandlers,shallowReadonlyHandlers} from "./baseHandlers";

export enum ReactiveFlags {
    IS_REACTIVE = '__v_reactive',
    IS_READONLY = '__v_readonly',
}
export const reactive = (raw:any) =>{
    return createActiveObject(raw,mutableHandlers)
}
export const readonly = (raw:any) =>{
    return createActiveObject(raw,readonlyHandlers)
}
export const shallowReadonly = (raw:any) =>{
    return createActiveObject(raw,shallowReadonlyHandlers)
}
export const isReactive = (raw:any) =>{
    return !!raw[ReactiveFlags.IS_REACTIVE]
}
export const isReadonly = (raw:any) =>{
    return !!raw[ReactiveFlags.IS_READONLY]
}
// 返回是否为 Reactive 或 Readonly 处理过的对象判断
export const isProxy = (raw:any) =>{
    return isReactive(raw) || isReadonly(raw)
}
const createActiveObject = (raw:any,baseHandlers:any) =>{
    return new Proxy(raw,baseHandlers)
}
