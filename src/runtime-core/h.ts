import {createVNode} from "./vnode";
export function h(rootComponent:any,props?:any,children?:any){
    return createVNode(rootComponent,props,children)
}