import {createVNode} from "./vnode";

export function createAppApi(render:Function){
    return function createApp(rootComponent:any){
        return{
            mount(rootContainer:string){
                // 根据根组件 rootComponent ，创建vnode
                const vnode = createVNode(rootComponent)
                // 调用 render 开始处理 vnode 和 rootContainer 直至最终渲染
                render(null,vnode,rootContainer)
            }
        }
    }
}