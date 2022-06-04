import {nodeTypes} from "./ast";

export function isText(node:any){
    return node.type === nodeTypes.TEXT || node.type === nodeTypes.INTERPOLATION
}