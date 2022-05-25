import {isObject} from "../shared/index";
import {PublicInstanceProxyHandlers} from "./componentPublicInstance";
import {initProps} from "./componentProps";
import {shallowReadonly} from "../reactivity/reactive";
import {emit} from "./componentEmit";
import {initSlots} from "./componentSlots";
import {proxyRefs} from "../reactivity/ref";


export function createComponentInstance(vnode:any,parent:any){
    const instance =  {
        vnode,
        type:vnode.type,// 这个是原始组件对象
        setupState:{}, // setup的返回结果对象
        props:{},
        next:null,// 待更新的新虚拟节点
        provides:parent ? parent.provides : {},
        parent,
        isMounted:false,// 标记是否初始化过
        subTree:{},// 子虚拟节点树
        emit:(event: string, ...arg: any[])=>{},
        slots:{}
    }
    instance.emit = emit.bind(null,instance)
    return instance
}
export function setupComponent(instance:any){
    // 初始化处理 props
    // initProps
    initProps(instance,instance.vnode.props)
    // 初始化处理插槽
    initSlots(instance,instance.vnode.children)
    // 创建一个有状态的组件
    setStatefulComponent(instance)
}

export function setStatefulComponent(instance:any){
    // 获取原始组件对象（注意这里并不是组件实例）
    const component = instance.type
    // 创建要给组件实例代理，使得render方法内能够通过this访问组件实例,如this.$el等
    instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)
    // 获取原始组件对象的 setup 方法
    const setup = component.setup
    if(setup){
        // ao yong setup qian  she zhi instance
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props),{
            emit:instance.emit
        })
        setCurrentInstance(instance)
        // 处理setup结果
        handleSetupResult(instance,setupResult)
    }

}
export function handleSetupResult(instance:any,setupResult:any){
    // 如果setup结果，是一个对象，就把结果挂载到instance上
    if(isObject(setupResult)){
        instance.setupState = setupResult
    }

    if (typeof setupResult === "function") {
        // 如果返回的是 function 的话，那么绑定到 render 上
        // 认为是 render 逻辑
        // setup(){ return ()=>(h("div")) }
        instance.render = setupResult;
    } else if (typeof setupResult === "object") {
        // 返回的是一个对象的话
        // 先存到 setupState 上
        // 先使用 @vue/reactivity 里面的 proxyRefs
        // 后面我们自己构建
        // proxyRefs 的作用就是把 setupResult 对象做一层代理
        // 方便用户直接访问 ref 类型的值
        // 比如 setupResult 里面有个 count 是个 ref 类型的对象，用户使用的时候就可以直接使用 count 了，而不需要在 count.value
        // 这里也就是官网里面说到的自动结构 Ref 类型
        instance.setupState = proxyRefs(setupResult);
    }
    // 处理渲染函数render具体方法，渲染函数可能来自于模板编译、setup返回、render的option
    finishComponentSetup(instance)

}
// 最后处理渲染函数方法，自此组件setup相关初始化流程结束
export function finishComponentSetup(instance:any){
    const component = instance.type
    // 如果组件 instance 上用户render
    // render 优先级 setup的返回render，组件内option的render，template
    if (!instance.render) {
        instance.render = component.render;
    }
}
let currentInstance:any = null
export function getCurrentInstance() {
    return currentInstance
}
export function setCurrentInstance(instance:any) {
    currentInstance = instance
}