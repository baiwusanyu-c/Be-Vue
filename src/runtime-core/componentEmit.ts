import {camelize, toHandlerKey} from "../shared/index";

export function emit(instance:any,event:string,...arg:any):void {
    const { props } = instance
    const handlerName = toHandlerKey(camelize(event))
    const handler = props[handlerName]
    handler && handler(...arg)
}