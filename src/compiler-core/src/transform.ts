function createRootCodegen(root:any) {
    root.codegenNode = root.children[0]
}

export function transform(root:any,option:any = {}){
    const context = createTransFormContext(root,option)
    traverseNode(root,context)
    createRootCodegen(root)
}

function traverseChildren(root: any, context: any) {
    const children = root.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            traverseNode(children[i], context)
        }
    }
}

export function traverseNode(root:any,context:any){
    // 执行传入的转换函数
    const nodeTransforms = context.nodeTransforms
    if(nodeTransforms){
        for (let i = 0;i < nodeTransforms.length;i++){
            nodeTransforms[i](root)
        }
    }
    // 深度优先遍历ast
    traverseChildren(root, context);

}
export function createTransFormContext(root:any,option:any){
    return {
        root,
        nodeTransforms:option.nodeTransforms || []
    }
}