import {createRenderer} from "../runtime-core/renderer";

function createElement(type:string) {
    return document.createElement(type)
}
function patchProps(el:any,props:any) {
    const isOn = (key: string) => {
        return /on[A-z]/.test(key)
    }
    for (let key in props) {
        let val = props[key]
        // 处理事件
        if (isOn(key)) {
            const eventName = key.slice(2).toLowerCase()
            el.addEventListener(eventName, val)
        } else {
            el.setAttribute(key, val)
        }
    }
}
function insert(el:any, container:any) {
    container.append(el)
}

const renderer:any = createRenderer({
    createElement,
    patchProps,
    insert,
})

export function createApp(...args:any[]){
    return renderer.createApp(...args)
}
export * from '../runtime-core'