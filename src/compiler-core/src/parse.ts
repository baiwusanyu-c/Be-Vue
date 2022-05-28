// 生成上下文，用于后面的解析
import {nodeTypes} from "./ast";

function createParserContext(content: string) {
    return {
        source:content
    }
}
// 生成ast root
function createRoot(parseChildren: any) {
    return {
        children:parseChildren
    }
}

// 解析 {{}}
function parseInterpolation(context: any) {
    // {{ message }}
    let startDelimiter = '{{'
    let closeDelimiter = '}}'
    // 获取 '}}' 位置
    let closeIndex = context.source.indexOf(closeDelimiter,startDelimiter.length)
    // 消费 '{{'
    advanceBy(context,startDelimiter.length)
    // 截取 content
    let rawContent = context.source.slice(0,closeIndex - startDelimiter.length)
    let content = rawContent.trim()
    // 消费 '}}'
    advanceBy(context,rawContent.length + closeDelimiter.length)
    return {
        type:nodeTypes.INTERPOLATION,
        content:{
            type:nodeTypes.SIMPLE_EXPRESSION,
            content:content
        }
    }
}
function advanceBy(context:any,index:any) {
    context.source = context.source.slice(index)
}
// 解析 children
function parseChildren(context: any) {
    const nodes = []
    let node
    // 以 {{ 则走解析插值逻辑
    if(context.source.startsWith('{{')){
        node = parseInterpolation(context)
    }
    nodes.push(node)
    return nodes
}


export function baseParse(content:string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}