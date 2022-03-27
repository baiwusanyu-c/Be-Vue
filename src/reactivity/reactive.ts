import {mutableHandlers, readonlyHandlers} from "./baseHandlers";

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
export const isReactive = (raw:any) =>{
    return !!raw[ReactiveFlags.IS_REACTIVE]
}
export const isReadonly = (raw:any) =>{
    return !!raw[ReactiveFlags.IS_READONLY]
}
const createActiveObject = (raw:any,baseHandlers:any) =>{
    return new Proxy(raw,baseHandlers)
}
