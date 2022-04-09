const publicPropertiesMap:any = {
    $el:(i:any)=>{return i.vnode.el}
}


export const PublicInstanceProxuHandlers = {
    // @ts-ignore
    get({_:instance}, key:any, receiver: any): any {
        const {setupState} = instance
        if(key in setupState){
            return setupState[key]
        }
        const publicGetter = publicPropertiesMap[key]
        if(publicGetter){
            return publicGetter(instance)
        }

    }
}