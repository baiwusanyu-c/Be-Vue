import {isObject, isString} from "../shared/index";
import {shapeFlags} from "../shared/ShapeFlags";

export function createVNode(rootComponent:any,props?:any,children?:any){
    const vnode =  {
        type:rootComponent,
        props,
        children,
        shapeFlag:getShapeFlag(rootComponent),// 设置初始时点的 shapeFlag
    }
    if(isString(vnode.children)){
        return shapeFlags.TEXT_CHILDREN
    }
    if(isObject(vnode.children)){
        return shapeFlags.ARRAY_CHILDREN
    }

    return vnode
}
function getShapeFlag(type:any){
    if(isString(type)){
        return shapeFlags.ELEMENT
    }
    if(isObject(type)){
        return shapeFlags.STATEFUL_COMPONENT
    }

}