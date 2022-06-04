import {nodeTypes} from "./ast";
import {TO_DISPLAY_STRING} from "./runtimeHelpers";

function createRootCodegen(root:any) {
    root.codegenNode = root.children[0]
}

export function transform(root:any,option:any = {}){
    const context = createTransFormContext(root,option)
    traverseNode(root,context)
    createRootCodegen(root)
    root.helpers = [...context.helpers.keys()]
}

function traverseChildren(root: any, context: any) {
    const children = root.children
    for (let i = 0; i < children.length; i++) {
        traverseNode(children[i], context)
    }

}
// 遍历ast，并调用 转换函数
export function traverseNode(root:any,context:any){
    // 执行传入的转换函数
    const nodeTransforms = context.nodeTransforms
    if(nodeTransforms){
        for (let i = 0;i < nodeTransforms.length;i++){
            nodeTransforms[i](root,context)
        }
    }
    switch (root.type) {
        case nodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break;
        case nodeTypes.ELEMENT:
        case nodeTypes.ROOT:
            // 深度优先遍历ast
            traverseChildren(root, context);
            break;
        default:
            break;
    }


}
// 生成 transform 上下文
export function createTransFormContext(root:any,option:any){
    const context =  {
        root,
        nodeTransforms:option.nodeTransforms || [],
        helpers:new Map(),
        helper:(key:string)=>{
            context.helpers.set(key,1)
        }
    }
    return context
}