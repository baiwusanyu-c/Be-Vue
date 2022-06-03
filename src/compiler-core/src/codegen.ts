export function codegen(ast: any) {
    const context = createCodegenContext(ast)
    const {push} = context
    push('return ')
    push('function ')
    const argList = ['_ctx','_cache']
    const signature = argList.join(', ')
    const functionName = 'render'
    push(`${functionName}( ${signature}){`)
    push('return ')
    genNode(ast.codegenNode,context)
    push(`}`)
    return {
        code:context.code
    }
}
function genNode(node:any,context:any){
    const {push} = context
    push(node.content)
}
function createCodegenContext(ast:any){
    const context =  {
        code:'',
        push:(source:string)=>{
            context.code += source
        }
    }
    return context
}