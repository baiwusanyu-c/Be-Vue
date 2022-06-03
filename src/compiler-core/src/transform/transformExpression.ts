import {nodeTypes} from "../ast";

export function transformExpression(node:any){
    if (node.type === nodeTypes.INTERPOLATION){
        let contextNode = processExpression(node.content)
        node.content = contextNode
    }
}
function processExpression(node:any){
     node.content = `_ctx.${node.content}`
     return node
}