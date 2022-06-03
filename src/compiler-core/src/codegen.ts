import {helperMapName, TO_DISPLAY_STRING} from "./transform/runtimeHelpers";
import {nodeTypes} from "./ast";


export function codegen(ast: any) {
    const context = createCodegenContext(ast)
    const {push} = context
    genFunctionPreamble(ast,context);
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

function genText(node:any,context:any) {
    const {push} = context
    push(node.content)
}

function proccessContent(node: any, context: any) {
    const rawContent = node.content
    genNode(rawContent,context)
}

function genInterpolation(node:any,context:any) {
    const {push,helper} = context
    push(`${helper(helperMapName[TO_DISPLAY_STRING])}`)
    push(`(`)
    genNode(node.content, context)
    push(`)`)
}

function genSimpleExpression(node: any, context: any) {
    const {push} = context
    push(`${node.content}`)
}

function genNode(node:any,context:any){
    switch (node.type) {
        case nodeTypes.TEXT:
            genText(node, context);
            break;
        case nodeTypes.INTERPOLATION:
            genInterpolation(node, context);
            break;
        case nodeTypes.SIMPLE_EXPRESSION:
            genSimpleExpression(node, context);
            break;
        default:
            break;
    }
   
}
function createCodegenContext(ast:any){
    const context =  {
        code:'',
        push:(source:string)=>{
            context.code += source
        },
        helper:(key:string)=>`_${key}`
    }
    return context
}
function genFunctionPreamble(node:any,context:any) {
    const { push } = context
    const bindging = 'vue'
    const aliasHelpers = ((s:any) => s = `${helperMapName[s as keyof  typeof helperMapName]}: _${helperMapName[s as keyof  typeof helperMapName]}`)
    if(node.helpers.length > 0){
        push(`const { ${node.helpers.map(aliasHelpers).join(', ')} } = ${bindging}`)
    }
    push('\n')
    push('return ')
}