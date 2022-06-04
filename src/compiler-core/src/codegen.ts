import {CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING} from "./runtimeHelpers";
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
// 生成 文本类型
function genText(node:any,context:any) {
    const {push} = context
    push(node.content)
}

// 生成 差值 {{}}
function genInterpolation(node:any,context:any) {
    const {push,helper} = context
    push(`${helper(helperMapName[TO_DISPLAY_STRING])}`)
    push(`(`)
    genNode(node.content, context)
    push(`)`)
}
// 生成 简单表达式 _ctx.foo
function genSimpleExpression(node: any, context: any) {
    const {push} = context
    push(`${node.content}`)
}

function genElement(node: any, context: any) {
    const {push,helper} = context
    push(`${helper(helperMapName[CREATE_ELEMENT_VNODE])}`)
    push(`(`)
    push(`'${node.tag}'`)
    push(`)`)
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
        case nodeTypes.ELEMENT:
            genElement(node, context);
            break;
        default:
            break;
    }
   
}
// 生成上下文对象
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
// 生成导入语句
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