import {isObject} from "../shared/index";
import {PublicInstanceProxuHandlers} from "./componentPublicInstance";
import {initProps} from "./componentProps";
import {shallowReadonly} from "../reactivity/reactive";
import {emit} from "./componentEmit";


export function createComponentInstance(vnode:any){
    const instance =  {
        vnode,
        type:vnode.type,// 这个是原始组件对象
        setupState:{}, // setup的返回结果对象
        props:{},
        emit:(event: string, ...arg: any[])=>{}
    }
    instance.emit = emit.bind(null,instance)
    return instance
}
export function setupComponent(instance:any){
    // 初始化处理 props
    // initProps
    initProps(instance,instance.vnode.props)
    // 初始化处理插槽
    // initSlots
    // 创建一个有状态的组件
    setStatefulComponent(instance)
}

export function setStatefulComponent(instance:any){
    // 获取原始组件对象（注意这里并不是组件实例）
    const component = instance.type
    // 创建要给组件实例代理，使得render方法内能够通过this访问组件实例,如this.$el等
    instance.proxy = new Proxy({_:instance},PublicInstanceProxuHandlers)
    // 获取原始组件对象的 setup 方法
    const setup = component.setup
    if(setup){
        const setupResult = setup(shallowReadonly(instance.props),{
            emit:instance.emit
        })
        // 处理setup结果
        handleSetupResult(instance,setupResult)
    }

}
export function handleSetupResult(instance:any,setupResult:any){
    // 如果setup结果，是一个对象，就把结果挂载到instance上
    if(isObject(setupResult)){
        instance.setupState = setupResult
    }
    // 处理渲染函数render具体方法，渲染函数可能来自于模板编译、setup返回、render的option
    finishComponentSetup(instance)

}
// 最后处理渲染函数方法，自此组件setup相关初始化流程结束
export function finishComponentSetup(instance:any){
    const component = instance.type
    // 如果组件 instance 上用户render // render 优先级 setup的返回render，组件内option的render，template
    if(component.render){
        // 就是用用户写的 render的option
        instance.render = component.render
    }
}