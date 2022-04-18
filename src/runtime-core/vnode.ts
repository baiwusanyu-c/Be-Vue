import {isArray, isObject, isString} from "../shared/index";
import {shapeFlags} from "../shared/ShapeFlags";
import {TEXT} from "./renderer";

export function createVNode(rootComponent: any, props?: any, children?: any) {
    const vnode = {
        __is_VNode: true,
        type: rootComponent,
        props,
        children,
        shapeFlag: getShapeFlag(rootComponent),// 设置初始时点的 shapeFlag
    }
    // czh
    if(rootComponent === TEXT){
        vnode.shapeFlag! |= shapeFlags.ELEMENT
    }
    if (isString(vnode.children)) {
        vnode.shapeFlag! |= shapeFlags.TEXT_CHILDREN
    }
    if (isArray(vnode.children)) {
        vnode.shapeFlag! |= shapeFlags.ARRAY_CHILDREN
    }
    // 判断slots
    if(vnode.shapeFlag! & shapeFlags.STATEFUL_COMPONENT){
        if (isObject(vnode.children)) {
            vnode.shapeFlag! |= shapeFlags.SLOTS_CHILDREN
        }
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