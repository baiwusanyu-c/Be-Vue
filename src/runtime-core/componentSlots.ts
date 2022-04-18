import {isArray} from "../shared/index";
import {shapeFlags} from "../shared/ShapeFlags";

export function initSlots(instance:any,children:any){
    if(instance.vnode.shapeFlag & shapeFlags.SLOTS_CHILDREN){
        normalizeObjectSlots(children,instance.slots)
    }
}
function normalizeObjectSlots(children:any,slot:any){
    for(let key in children){
        const value = children[key]
        slot[key] = (props:any)=>normalizeSlots(value(props))
    }
}
function normalizeSlots(value:any){
    return isArray(value) ? value : [value]
}