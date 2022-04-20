import {createVNode, FRAGMENT} from "../vnode";

export function renderSlots(slots:any,name:string,props:any){
    const slot = slots[name]
    if(slot){
        return createVNode(FRAGMENT,{},slot(props))
    }

}