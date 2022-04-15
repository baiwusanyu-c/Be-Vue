import {isArray, isObject, isString} from "../shared/index";
import {shapeFlags} from "../shared/ShapeFlags";

export function createVNode(rootComponent: any, props?: any, children?: any) {
    const vnode = {
        __is_VNode: true,
        type: rootComponent,
        props,
        children,
        shapeFlag: getShapeFlag(rootComponent),// 设置初始时点的 shapeFlag
    }
    if (isString(vnode.children)) {
        vnode.shapeFlag! |= shapeFlags.TEXT_CHILDREN
    }
    if (isArray(vnode.children)) {
        vnode.shapeFlag! |= shapeFlags.ARRAY_CHILDREN
    }

    return vnode
}

function getShapeFlag(type: any) {
    if (isString(type)) {
        return shapeFlags.ELEMENT
    }
    if (isObject(type)) {
        return shapeFlags.STATEFUL_COMPONENT
    }
}

export function isVNode(target: any) {
    if (isObject(target)){
        return false
    }
    return !!target.__is_VNode
}