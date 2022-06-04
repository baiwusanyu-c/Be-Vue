import {CREATE_ELEMENT_VNODE} from "./runtimeHelpers";

export const enum nodeTypes {
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ELEMENT,
    TEXT,
    ROOT,
    COMPOUND_EXPRESSION,
}
export function createVNodeCall(context:any,tag:any,props:any,children:any){
    context.helper(CREATE_ELEMENT_VNODE)
    return {
        type: nodeTypes.ELEMENT,
        tag,
        props,
        children,
    }
}