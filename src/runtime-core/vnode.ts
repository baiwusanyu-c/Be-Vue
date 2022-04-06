export function createVNode(rootComponent:any,props?:any,children?:any){
    return {
        type:rootComponent,
        props,
        children
    }
}