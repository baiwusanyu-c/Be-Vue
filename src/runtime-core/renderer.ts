import {createComponentInstance, setupComponent} from "./component";
import {isArray, isObject, isString} from "../shared/index";
import {shapeFlags} from "../shared/ShapeFlags";

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
    // 处理 element类型
    const {shapeFlag} = vnode
    if(shapeFlag & shapeFlags.ELEMENT){
        processElement(vnode,container)
    }
    // 处理组件类型
    if(shapeFlag & shapeFlags.STATEFUL_COMPONENT){
        processComponent(vnode, container)
    }

}
/**
 * 处理元素方法
 * @param vnode
 * @param container
 */

function processElement(vnode:any,container:any){
    mountElement(vnode,container)
}
/**
 * 挂载元素方法
 * @param vnode
 * @param container
 */
function mountElement(vnode:any,container:any){
    const el = (vnode.el = document.createElement(vnode.type))
    let {children,shapeFlag} = vnode
    // 如果是文本元素就插入
    if(shapeFlag & shapeFlags.TEXT_CHILDREN){
        el.textContent = children
    }
    // 是数组就递归 patch 子节点
    if(shapeFlag & shapeFlags.ARRAY_CHILDREN){
        mountChildren(vnode,el)
    }
    // 处理属性
    const {props} = vnode
    for(let key in props){
        el.setAttribute(key,props[key])
    }
    container.append(el)
}
function mountChildren(vnode:any,container:any){
    vnode.children.forEach((elm:any) =>{
        patch(elm,container)
    })
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
    setupRenderEffect(instance,vnode,container)
}
function setupRenderEffect(instance:any,vnode:any,container:any){
    // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
    // 但是他一定是上一轮的子树
    const subTree = instance.render.call(instance.proxy)
    // 再次 patch，处理子树
    patch(subTree,container)
    // 记录根组件对应的el
    vnode.el = subTree.el
}