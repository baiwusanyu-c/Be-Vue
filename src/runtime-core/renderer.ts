import {createComponentInstance, setupComponent} from "./component";
import {shapeFlags} from "../shared/ShapeFlags";
import {FRAGMENT, TEXT} from "./vnode";
import {createAppApi} from "./createApp";
import {effect} from "../reactivity";
import {EMPTY_OBJ} from "../shared";
import {shouldUpdateComponent} from "./componentUpdateUtils";

export function createRenderer(option: any) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        setElementText: hostSetElementText,
        remove: hostRemove
    } = option

    function render(n1: any, n2: any, container: any) {
        patch(n1, n2, container, null, null)
    }

    /**
     * patch方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function patch(n1: any, n2: any, container: any, parent: any, anchor: any) {
        if (!n2) {
            return
        }
        // 根据 vnode 类型不同，进行不同处理
        // 处理 element类型
        const {shapeFlag, type} = n2
        switch (type) {
            case TEXT:
                processText(n1, n2, container)
                break;
            case  FRAGMENT:
                processFragment(n1, n2, container, parent, anchor)
                break;
            default: {
                if (shapeFlag & shapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parent, anchor)
                }
                // 处理组件类型
                if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parent, anchor)
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

    function processElement(n1: any, n2: any, container: any, parent: any, anchor: any) {
        if (!n1) {
            mountElement(n2, container, parent, anchor)
        } else {
            patchElement(n1, n2, container, parent, anchor)
        }

    }

    /**
     * 更新元素方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     */
    function patchElement(n1: any, n2: any, container: any, parent: any, anchor: any) {
        console.log('patch Element')
        console.log('n1')
        console.log(n1)
        console.log('n2')
        console.log(n2)
        const el = (n2.el = n1.el)
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        patchChildren(n1, n2, el, parent, anchor)
        patchProps(oldProps, newProps, el)
    }

    function patchChildren(n1: any, n2: any, container: any, parent: any, anchor: any) {
        const prevShapeFlag = n1.shapeFlag
        const c1 = n1.children
        const shapeFlag = n2.shapeFlag
        const c2 = n2.children
        // 新子节点是文本
        if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
            // 老的子节点是数组，则卸载
            if (prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1)
            }
            // 无论老的子节点是数组，还是文本，都替换新文本
            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }
        } else {
            // 新的是数组，老的是文本，就清空文本，挂载新子节点
            if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {

                hostSetElementText(container, '')
                mountChildren(c2, container, parent, anchor)
            } else {
                //新老子节点都是数组 开始diff
                patchKeyedChildren(c1, c2, container, parent, anchor)
            }
        }
    }

    function patchKeyedChildren(c1: any, c2: any, container: any, parent: any, anchor: any) {
        let indexStart = 0
        let oldIndexEnd = c1.length - 1
        let newIndexEnd = c2.length - 1
        let newChildLen = c2.length
        // 头部扫描，当 oldIndexEnd 大于于 newIndexEnd 或 newChildLen 停止
        // 当节点不同，停止
        while (indexStart <= oldIndexEnd && indexStart <= newIndexEnd) {
            // indexStart 指向的新旧虚拟节点相同，则递归patch
            if (isSameVNode(c1[indexStart], c2[indexStart])) {
                patch(c1[indexStart], c2[indexStart], container, parent, anchor)
            } else {
                break;
            }
            // 移动指针
            indexStart++
        }
        // 头尾部扫描，当 oldIndexEnd 大于于 newIndexEnd 或 newChildLen 停止
        // 当节点不同，停止
        while (indexStart <= oldIndexEnd && indexStart <= newIndexEnd) {
            // indexStart 指向的新旧虚拟节点相同，则递归patch
            if (isSameVNode(c1[indexStart], c2[indexStart])) {
                patch(c1[indexStart], c2[indexStart], container, parent, anchor)
            } else {
                break;
            }
            // 移动指针
            oldIndexEnd--
            newIndexEnd--
        }
        // 头部扫描 与 尾部扫描结束后，根据指针指向情况
        // 处理头部节点序列、头部节点序列的新增或修改情况
        // 从逻辑上来看 头部扫描 与 尾部扫描 是为了达到将那些
        // 没有发生移动的节点预先处理的目的，此时处理过后
        // 新旧虚拟节点数组中，没有被扫描的中间部分，才包含着移动节点的情况

        //  头部扫描 与 尾部扫描 节点新增
        //  此时 indexStart > oldIndexEnd && indexStart <= newIndexEnd
        //  此时 indexStart ~ newIndexEnd 之间为新增节点
        //    oE           oE
        // (a b)    或  (a b)
        // (a b) c      (a b) c d
        //      s/nE          s nE
        if (indexStart > oldIndexEnd) {
            if (indexStart <= newIndexEnd) {
                // 挂载新的节点
                let nextPos = indexStart + 1
                let anchor = nextPos < newChildLen ? c2[nextPos].el : null
                while (indexStart <= newIndexEnd) {
                    patch(null, c2[indexStart], container, parent, anchor)
                    indexStart++
                }
            }
        } else if (indexStart > newIndexEnd) {
            //  头部扫描 与 尾部扫描 旧节点删除
            //  此时 indexStart > newIndexEnd && indexStart <= oldIndexEnd
            //  此时 indexStart ~ oldIndexEnd 之间为需要删除节点
            //       oE              oE
            // (a b) c   或  (a b) c d
            // (a b)        (a b)
            //    nE s        nE  s
            if (indexStart <= oldIndexEnd) {
                while (indexStart <= oldIndexEnd) {
                    hostRemove(c1[indexStart].el)
                    indexStart++
                }
            }
        } else {
            // 处理中间部分节点序列
            //
            let s1 = indexStart;
            let s2 = indexStart
            // 新的中间部分节点序列数量
            let newChildNum = newIndexEnd - indexStart + 1
            // 已经处理过的中间节点序列数量
            let patched = 0
            // 新的中间部分节点序列映射表
            let newToIndexMap = new Map()
            // 建立映射
            for (let i = 0; i < s2; i++) {
                if (c2[i].key) {
                    newToIndexMap.set(c2.key, i)
                }
            }
            // 建立映射表。该映射表的索引对应新的中间部分节点序列
            // 值对于旧的中间部分节点序列
            let newIndexToOldIndexMap = new Array(newChildNum)
            // 初始化 newIndexToOldIndexMap， newIndexToOldIndexMap[i] === 0 表示节点新增
            for(let i = 0;i <= newChildNum;i++) newIndexToOldIndexMap[i] = 0
            // 节点是否移动
            let move = false
            let newIndexSoFar = 0
            // 遍历旧中间部分节点序列
            for (let i = 0; i < s1; i++) {
                const prevChild = c1[i]
                // 新的节点序列比旧的先处理完，旧的剩余的统统删除
                if (patched >= newChildNum) {
                    hostRemove(prevChild.el)
                    continue
                }
                // 当前旧节点在新序列中索引
                // 这里是用旧的节点去新的节点序列中查找，看是否找到
                let oldInNewIndex
                // 如果传了key，就用映射表，否则就要遍历新的序列
                if (prevChild.key) {
                    oldInNewIndex = newToIndexMap.get(prevChild.key)
                } else {
                    for (let j = 0; j <= s2; j++) {
                        if (isSameVNode(prevChild, c2[j])) {
                            oldInNewIndex = j
                            break;
                        }
                    }
                }
                // 旧的节点不在新的节点序列中，删除旧节点
                if (oldInNewIndex === null) {
                    hostRemove(prevChild.el)
                } else {

                    if(oldInNewIndex >= newIndexSoFar){
                        newIndexSoFar = oldInNewIndex
                    }else{
                        move = true
                    }

                    // 将节点在旧的序列中位置记录到对应的‘新的’映射表中，
                    // 这里+1 是为了避免 第一个就匹配到，和初始值作区分
                    newIndexToOldIndexMap[oldInNewIndex - s2] = i + 1
                    // 旧的节点在新的节点序列中，递归patch
                    patch(prevChild, c2[oldInNewIndex], container, parent, null)
                    // 记录已处理的新节点数量
                    patched++
                }

            }
            // 根据 newIndexToOldIndexMap 计算最长递增子序列(返回值是新中间节点序列中最长递增子序列的索引组成的数组)
            //      2 3 4
            // a,b,(c,d,e),f,g
            // a,b,(e,c,d),f,g
            //      0 1 2
            // 最长子序列： [1,2]
            // newIndexToOldIndexMap:[5，3，4]（加了1）
            let increasingNewIndexSequence = move ? getSequence(newIndexToOldIndexMap) : []
            let j = increasingNewIndexSequence.length - 1
            // 倒序遍历新的中间节点序列，倒序是为了保证移动时锚点是稳定的，正序遍历无法确定锚点是否稳定
            for(let i = newChildNum;i>=0;i--){
                let nextIndex = i + s2
                let nexChild = c2[nextIndex]
                let anchor = nextIndex + 1 > newChildLen ? null : c2[nextIndex + 1].el
                // 新增的节点
                if(newIndexToOldIndexMap[i] === 0){
                    patch(null,nexChild, container,parent,anchor)
                }
                // 新的节点 在递增子序列中找得到 就不需要移动
                if(move){
                    if(j < 0 || increasingNewIndexSequence[j] !== i){
                        // 移动节点
                        hostInsert(nexChild.el, container,anchor)
                    }else{
                        j--
                    }
                }

            }



        }
    }

    function isSameVNode(n1: any, n2: any) {
        return n1.type === n2.type && n1.key === n2.key
    }

    function unmountChildren(children: Array<any>) {
        for (let i: number = 0; i < children.length; i++) {
            const el = children[i].el
            hostRemove(el)
        }

    }

    /**
     * 处props
     */
    function patchProps(oldProps: any, newProps: any, el: any) {
        if (oldProps !== newProps) {
            for (let key in newProps) {
                const prevProps = oldProps[key]
                const nextProps = newProps[key]
                // props 被修改为了 null 或 undefined，我们需要删除
                if (nextProps === null || nextProps === undefined) {
                    hostPatchProp(el, key, prevProps, null)
                }
                // props 发生了改变 'foo' => 'new foo',我们需要修改
                if (prevProps !== nextProps) {
                    hostPatchProp(el, key, prevProps, nextProps)
                }
            }
            if (EMPTY_OBJ !== oldProps) {
                for (let key in oldProps) {
                    const prevProps = oldProps[key]
                    const nextProps = newProps[key]
                    // props 在新的VNode中不存在，而旧的VNode中还存在，则删除
                    if (!nextProps) {
                        hostPatchProp(el, key, prevProps, nextProps)
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
    function mountElement(vnode: any, container: any, parent: any, anchor: any) {

        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = hostCreateElement(vnode.type))
        let {children, shapeFlag} = vnode
        // 如果是文本元素就插入
        if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        }
        // 是数组就递归 patch 子节点
        if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parent, anchor)
        }
        // 处理属性

        const {props} = vnode
        for (let key in props) {
            let val = props[key]
            hostPatchProp(el, key, null, val)
        }
        // insert the el to container
        hostInsert(el, container)
    }

    function mountChildren(children: any, container: any, parent: any, anchor: any) {
        children.forEach((elm: any) => {
            patch(null, elm, container, parent, anchor)
        })
    }

    /**
     * 处理组件方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function processComponent(n1: any, n2: any, container: any, parent: any, anchor: any) {
        if(!n1){
            mountComponent(n2, container, parent, anchor)
        }else {
            // 更新组件
            updateComponent(n1, n2)
        }

    }
    function updateComponent(n1: any, n2: any){
        const instance = (n2.components = n1.components)
        // 对比props 看是否需要更新
        if(shouldUpdateComponent(n1,n2)){
            instance.next = n2
            // 更新组件
            instance.update()
        }else{
            // 不更新，也要跟新实力上的el、vnode
           n2.el = n1.el
           instance.vnode = n2
        }
    }
    /**
     * 挂载组件方法
     * @param vnode
     * @param container
     * @param parent
     */
    function mountComponent(vnode: any, container: any, parent: any, anchor: any) {
        // 创建组件实例
        const instance = (vnode.components = createComponentInstance(vnode, parent))
        // 开始 处理组件setup
        setupComponent(instance)
        // 开始处理 setup 运行完成后内涵的子节点
        // 可以理解初始化时，我们处理的是根节点组件与容器
        // 这里就是处理根组件下的子组件了
        setupRenderEffect(instance, vnode, container, anchor)
    }

    function setupRenderEffect(instance: any, vnode: any, container: any, anchor: any) {
        // 缓存runner，在组件更新时调用
        instance.update = effect(() => {
            // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
            // 但是他一定是上一轮的子树
            const subTree = instance.render.call(instance.proxy)
            // 初始化逻辑
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy))

                // 再次 patch，处理子树
                patch(null, subTree, container, instance, anchor)
                // 记录根组件对应的el
                vnode.el = subTree.el
                instance.isMounted = true
            } else {
                // 更新el、props、vnode
                const {next} = instance
                if(next){
                    // 更新el
                    next.el = vnode.el
                    updateComponentPreRender(instance,next)
                }
                const subTree = instance.render.call(instance.proxy)
                // 更新逻辑
                const prevSubTree = instance.subTree
                instance.subTree = subTree
                // 再次 patch，处理子树
                patch(prevSubTree, subTree, container, instance, anchor)
                // 记录根组件对应的el
                vnode.el = subTree.el
            }
        })

    }
    function updateComponentPreRender(instance:any,nextVNode:any){
        instance.vnode = nextVNode
        instance.next = null
        instance.props = nextVNode.props
    }
    /**
     * 处理fragment
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function processFragment(n1: any, n2: any, container: any, parent: any, anchor: any) {
        mountChildren(n2.children, container, parent, anchor)
    }

    /**
     * 处理文本方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     */
    function processText(n1: any, n2: any, container: any) {
        const {children} = n2
        const text = n2.el = document.createTextNode(children)
        container.append(text)

    }

    return {
        createApp: createAppApi(render)
    }
}
function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
