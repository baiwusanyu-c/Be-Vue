import {createComponentInstance, setupComponent} from "./component";

export function render(vnode:any,container:any){
    patch(vnode,container)
}

/**
 * patch方法
 * @param vnode
 * @param container
 */
export function patch(vnode:any,container:any){
    // 根据 vnode 类型不同，进行不同处理

    // 处理组件类型
    processComponent(vnode,container)
}

/**
 * 处理组件方法
 * @param vnode
 * @param container
 */
function processComponent(vnode:any,container:any){
    mountComponent(vnode,container)
}

/**
 * 挂载组件方法
 * @param vnode
 * @param container
 */
function mountComponent(vnode:any,container:any){
    // 创建组件实例
    const instance = createComponentInstance(vnode)
    // 开始 处理组件setup
    setupComponent(instance)
    // 开始处理 setup 运行完成后内涵的子节点
    // 可以理解初始化时，我们处理的是根节点组件与容器
    // 这里就是处理根组件下的子组件了
    setupRenderEffect(instance,container)
}
function setupRenderEffect(instance:any,container:any){
    // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
    // 但是他一定是上一轮的子树
    const subTree = instance.render()
    // 再次 patch，处理子树
    patch(subTree,container)

}