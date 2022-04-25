import {createComponentInstance, setupComponent} from "./component";
import {shapeFlags} from "../shared/ShapeFlags";
import {FRAGMENT, TEXT} from "./vnode";
import {createAppApi} from "./createApp";

export function createRenderer(option: any) {
    const {
        createElement:hostCreateElement,
        patchProps: hostPatchProps,
        insert: hostInsert
    } = option

    function render(vnode: any, container: any) {
        patch(vnode, container, null)
    }

    /**
     * patch方法
     * @param vnode
     * @param container
     * @param parent
     */
    function patch(vnode: any, container: any, parent: any) {
        if (!vnode) {
            return
        }
        // 根据 vnode 类型不同，进行不同处理
        // 处理 element类型
        const {shapeFlag, type} = vnode
        switch (type) {
            case TEXT:
                processText(vnode, container)
                break;
            case  FRAGMENT:
                processFragment(vnode, container, parent)
                break;
            default: {
                if (shapeFlag & shapeFlags.ELEMENT) {
                    processElement(vnode, container, parent)
                }
                // 处理组件类型
                if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parent)
                }
            }
        }


    }

    /**
     * 处理元素方法
     * @param vnode
     * @param container
     */

    function processElement(vnode: any, container: any, parent: any) {
        mountElement(vnode, container, parent)
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
        hostPatchProps(el,props)
        // insert the el to container
        hostInsert(el, container)
    }

    function mountChildren(vnode: any, container: any, parent: any) {
        vnode.children.forEach((elm: any) => {
            patch(elm, container, parent)
        })
    }

    /**
     * 处理组件方法
     * @param vnode
     * @param container
     * @param parent
     */
    function processComponent(vnode: any, container: any, parent: any) {
        mountComponent(vnode, container, parent)
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
        // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
        // 但是他一定是上一轮的子树
        const subTree = instance.render.call(instance.proxy)
        // 再次 patch，处理子树
        patch(subTree, container, instance)
        // 记录根组件对应的el
        vnode.el = subTree.el
    }

    /**
     * 处理fragment
     * @param vnode
     * @param container
     * @param parent
     */
    function processFragment(vnode: any, container: any, parent: any) {
        mountChildren(vnode, container, parent)

    }

    /**
     * 处理文本方法
     * @param vnode
     * @param container
     */
    function processText(vnode: any, container: any) {
        const {children} = vnode
        const text = vnode.el = document.createTextNode(children)
        container.append(text)

    }
    return {
        createApp:createAppApi(render)
    }
}
