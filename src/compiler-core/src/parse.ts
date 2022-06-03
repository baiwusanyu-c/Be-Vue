// 生成上下文，用于后面的解析
import {nodeTypes} from "./ast";
const enum TagType {
    start,
    end
}
// 生成ast 上下文对象
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
    // 截取 content && 消费 content
    let rawContent =   parseTextData(context,closeIndex - startDelimiter.length)
    // 消费 '}}'
    advanceBy(context,closeDelimiter.length)
    let content = rawContent.trim()
    return {
        type:nodeTypes.INTERPOLATION,
        content:{
            type:nodeTypes.SIMPLE_EXPRESSION,
            content:content
        }
    }
}
// 消费字符串
function advanceBy(context:any,index:any) {
    context.source = context.source.slice(index)
}


function startsWithEndTagOpen(source: any, tag: any) {
    return source.startsWith('</') && tag.toLowerCase() === source.slice(2,tag.length + 2).toLowerCase()
}

function parseElement(context: any,ancestors:any) {
    // 匹配标签名
    const element:any = parseTg(context,TagType.start)
    ancestors.push(element)
    element.children = parseChildren(context,ancestors)
    ancestors.pop()
    // 处理完children后，当前标签节点 和 上下文不匹配，则缺少关闭标签
    if(!startsWithEndTagOpen(context.source,element.tag)){
        throw new Error(`lack the end tag ${element.tag}`)
    }
    parseTg(context,TagType.end)
    return element
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
    return {
        type: nodeTypes.ELEMENT,
        tag:tag,
        children:[]
    }
}

function parseText(context: any) {
    let s = context.source
    let endIndex = s.length
    let endToken = ['<','{{']
    // 找到 source中  <','{{' 的位置 并进一步解析出文本
    for (let i = 0;i < endToken.length;i++){
        const index = s.indexOf(endToken[i])
        if(index !== -1 && index < endIndex){
            endIndex = index
        }
    }
    const content = parseTextData(context,endIndex)
    return {
        type: nodeTypes.TEXT,
        content
    }
}
function parseTextData(context: any,length:number) {
    const content = context.source.slice(0,length)
    // 消费
    advanceBy(context,length)
    return content
}

// 解析 children，基于有限状态机模式
function parseChildren(context: any,ancestors:any) {
    const nodes = []
    // 循环遍历children 字符串
    while(!isEnd(context,ancestors)){
        let node
        let s:string = context.source
        // 以 {{ 则走解析插值逻辑
        if(s.startsWith('{{')){
            node = parseInterpolation(context)
        }else if(s[0] === '<'){
            // 以 < 开头 且第二个字母为a-z 就当做element的标签解析
            if(/[a-z]/i.test(s[1])){
                node =  parseElement(context,ancestors)
            }
        }else{
            // 默认当做文本解析
            node =  parseText(context)
        }
        nodes.push(node)
    }

    return nodes
}
// 是否标签闭合
function isEnd(context:any,ancestors:any) {
 let s = context.source
 if(s.startsWith(`</`)){
     // 循环对比source 是否在缓存的标签数组中能找到‘开启标签’
     for(let i = ancestors.length - 1;i >= 0;i--){
         const tag = ancestors[i].tag
         if(startsWithEndTagOpen(s,tag)){
             return true
         }

     }

 }
 return !context.source
}

export function baseParse(content:string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context,[]))
}