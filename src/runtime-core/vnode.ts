import {isArray, isObject, isString} from "../shared/index";
import {shapeFlags} from "../shared/ShapeFlags";
export const TEXT = Symbol('TEXT')
export const FRAGMENT = Symbol('FRAGMENT')
export {
    createVNode as createElementVNode
}
export function createVNode(type: any, props?: any, children?: any) {
    const vnode = {
        __is_VNode: true,
        type: type,
        props,
        children,
        components:null,// 组件实例
        shapeFlag: getShapeFlag(type),// 设置初始时点的 shapeFlag
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
export function createTextVNode(children:string){
    return createVNode(TEXT,{},children)
}
export function isVNode(target: any) {
    if (isObject(target)){
        return false
    }
    return !!target.__is_VNode
}