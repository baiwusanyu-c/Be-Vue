import {hasOwn} from "../shared/index";

const publicPropertiesMap:any = {
    $el:(i:any)=>{return i.vnode.el},
    $slots:(i:any)=>{return i.slots}
}


export const PublicInstanceProxyHandlers = {
    // @ts-ignore
    get({_:instance}, key:any, receiver: any): any {
        const {setupState,props} = instance
        if(hasOwn(setupState,key)){
            return setupState[key]
        }
        if(hasOwn(props,key)){
            return props[key]
        }
        const publicGetter = publicPropertiesMap[key]
        if(publicGetter){
            return publicGetter(instance)
        }

    }
}