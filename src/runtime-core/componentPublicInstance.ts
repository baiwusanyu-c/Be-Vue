import {hasOwn} from "../shared/index";

const publicPropertiesMap:any = {
    $el:(i:any)=>{return i.vnode.el}
}


export const PublicInstanceProxuHandlers = {
    // @ts-ignore
    get({_:instance}, key:any, receiver: any): any {
        const {setupState,props} = instance
        if(key in setupState){
            return setupState[key]
        }
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