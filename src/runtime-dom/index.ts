import {createRenderer} from "../runtime-core/renderer";

function createElement(type:string) {
    return document.createElement(type)
}

/**
 * 渲染props
 * @param el
 * @param props
 */
function patchProp(el:any,key:string,oldVal:any,newVal:any) {
    const isOn = (key: string) => {
        return /on[A-z]/.test(key)
    }
    // 处理事件
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase()
        el.addEventListener(eventName, newVal)
    } else {
        if(newVal === null || newVal === undefined){
            el.removeAttribute(key)
        }else{
            el.setAttribute(key, newVal)
        }
    }

}
function insert(el:any, container:any) {
    container.append(el)
}
function setElementText(container:any,text:string) {
    container.textContent = text
}
function remove(el:any) {
    const parent = el.parentNode
    parent && parent.removeChild(el)
}
const renderer:any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
})

export function createApp(...args:any[]){
    return renderer.createApp(...args)
}
export * from '../runtime-core'