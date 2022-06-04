import {nodeTypes} from "../ast";

export function transformExpression(node:any){
    if (node.type === nodeTypes.ELEMENT){
        node.content = processExpression(node.content)
    }
}
function processExpression(node:any){
     node.content = `_ctx.${node.content}`
     return node
}