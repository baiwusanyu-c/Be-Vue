// 生成上下文，用于后面的解析
import {nodeTypes} from "./ast";
const enum TagType {
    start,
    end
}
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

function parseElement(context: any) {
    // 匹配标签名
    const tag = parseTg(context,TagType.start)
    parseTg(context,TagType.end)
    return {
        type: nodeTypes.ELEMENT,
        tag:tag
    }
}
function parseTg(context: any,type:TagType) {
    // 匹配标签名
    const match:any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]
    // 消费 '<div' / '</div'
    advanceBy(context,match[0].length )
    // 消费 '>'
    advanceBy(context,1)

    if(type === TagType.end) return
    return tag;
}

// 解析 children
function parseChildren(context: any) {
    const nodes = []
    let node
    let s:string = context.source
    // 以 {{ 则走解析插值逻辑
    if(s.startsWith('{{')){
        node = parseInterpolation(context)
    }else if(s[0] === '<'){
        // 以 < 开头 且第二个字母为a-z 就当做element的标签解析
        if(/[a-z]/i.test(s[1])){
            node =  parseElement(context)
        }
    }

    nodes.push(node)
    return nodes
}


export function baseParse(content:string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}