import {createComponentInstance, setupComponent} from "./component";
import {shapeFlags} from "../shared/ShapeFlags";
import {FRAGMENT, TEXT} from "./vnode";
import {createAppApi} from "./createApp";
import {effect} from "../reactivity";
import {EMPTY_OBJ} from "../shared";

export function createRenderer(option: any) {
    const {
        createElement:hostCreateElement,
        patchProp: hostpatchProp,
        insert: hostInsert
    } = option

    function render(n1:any,n2: any, container: any) {
        patch(n1, n2,container, null)
    }

    /**
     * patch方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function patch(n1:any,n2: any, container: any, parent: any) {
        if (!n2) {
            return
        }
        // 根据 vnode 类型不同，进行不同处理
        // 处理 element类型
        const {shapeFlag, type} = n2
        switch (type) {
            case TEXT:
                processText(n1,n2, container)
                break;
            case  FRAGMENT:
                processFragment(n1,n2, container, parent)
                break;
            default: {
                if (shapeFlag & shapeFlags.ELEMENT) {
                    processElement(n1,n2, container, parent)
                }
                // 处理组件类型
                if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1,n2, container, parent)
                }
            }
        }


    }

    /**
     * 处理元素方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */

    function processElement(n1:any,n2: any, container: any, parent: any) {
        if(!n1){
            console.log('init Element')
            mountElement(n2, container, parent)
        }else{
            patchElement(n1,n2,container)
        }

    }
    /**
     * 更新元素方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     */
    function patchElement(n1:any,n2: any, container: any){
        console.log('patch Element')
        console.log('n1')
        console.log(n1)
        console.log('n2')
        console.log(n2)
        const el = (n2.el = n1.el)
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        patchProps(oldProps,newProps,el)
    }

    /**
     * 处props
     */
    function patchProps(oldProps:any,newProps:any,el:any){
        if(oldProps !== newProps){
            for(let key in newProps){
                const prevProps = oldProps[key]
                const nextProps = newProps[key]
                // props 被修改为了 null 或 undefined，我们需要删除
                if(nextProps === null || nextProps === undefined){
                    hostpatchProp(el,key,prevProps,null)
                }
                // props 发生了改变 'foo' => 'new foo',我们需要修改
                if(prevProps !== nextProps){
                    hostpatchProp(el,key,prevProps,nextProps)
                }
            }
            if(EMPTY_OBJ !== oldProps){
                for(let key in oldProps){
                    const prevProps = oldProps[key]
                    const nextProps = newProps[key]
                    // props 在新的VNode中不存在，而旧的VNode中还存在，则删除
                    if(!nextProps){
                        hostpatchProp(el,key,prevProps,nextProps)
                    }
                }
            }
        }
    }
    /**
     * 挂载元素方法
     * @param vnode
     * @param container
     * @param parent
     */
    function mountElement(vnode: any, container: any, parent: any) {

        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = hostCreateElement(vnode.type))
        let {children, shapeFlag} = vnode
        // 如果是文本元素就插入
        if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        }
        // 是数组就递归 patch 子节点
        if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parent)
        }
        // 处理属性

        const {props} = vnode
        for (let key in props) {
            let val = props[key]
            hostpatchProp(el,key,null,val)
        }
        // insert the el to container
        hostInsert(el, container)
    }

    function mountChildren(vnode: any, container: any, parent: any) {
        vnode.children.forEach((elm: any) => {
            patch(null,elm, container, parent)
        })
    }

    /**
     * 处理组件方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function processComponent(n1:any,n2: any,container: any, parent: any) {
        mountComponent(n2, container, parent)
    }

    /**
     * 挂载组件方法
     * @param vnode
     * @param container
     * @param parent
     */
    function mountComponent(vnode: any, container: any, parent: any) {
        // 创建组件实例
        const instance = createComponentInstance(vnode, parent)
        // 开始 处理组件setup
        setupComponent(instance)
        // 开始处理 setup 运行完成后内涵的子节点
        // 可以理解初始化时，我们处理的是根节点组件与容器
        // 这里就是处理根组件下的子组件了
        setupRenderEffect(instance, vnode, container)
    }

    function setupRenderEffect(instance: any, vnode: any, container: any) {
        effect(()=>{
            // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
            // 但是他一定是上一轮的子树
            const subTree = instance.render.call(instance.proxy)
            // 初始化逻辑
            if(!instance.isMounted){
                instance.subTree = subTree
                // 再次 patch，处理子树
                patch(null,subTree, container, instance)
                // 记录根组件对应的el
                vnode.el = subTree.el
                instance.isMounted = true
            }else{
                // 更新逻辑
                const prevSubTree = instance.subTree
                instance.subTree = subTree
                // 再次 patch，处理子树
                patch(prevSubTree,subTree, container, instance)
                // 记录根组件对应的el
                vnode.el = subTree.el
            }
        })

    }

    /**
     * 处理fragment
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function processFragment(n1:any,n2: any,container: any, parent: any) {
        mountChildren(n2, container, parent)
    }

    /**
     * 处理文本方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     */
    function processText(n1:any,n2: any, container: any) {
        const {children} = n2
        const text = n2.el = document.createTextNode(children)
        container.append(text)

    }
    return {
        createApp:createAppApi(render)
    }
}
