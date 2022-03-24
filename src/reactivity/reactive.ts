import {mutableHandlers, readonlyHandlers} from "./baseHandlers";


export const reactive = (raw:any) =>{
    return createActiveObject(raw,mutableHandlers)
}
export const readonly = (raw:any) =>{
    return createActiveObject(raw,readonlyHandlers)
}

const createActiveObject = (raw:any,baseHandlers:any) =>{
    return new Proxy(raw,baseHandlers)
}
