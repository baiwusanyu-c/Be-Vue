import {nodeTypes} from "../ast";
import {CREATE_ELEMENT_VNODE} from "../runtimeHelpers";

export function transformElement(node: any, context: any) {
    if (node.type === nodeTypes.ELEMENT) {
        return () => {
            context.helper(CREATE_ELEMENT_VNODE)
            // 处理tag
            let vnodeTag = `'${node.tag}'`
            // 处理 props
            let vnodeProps
            const children = node.children
            let vnodeChildren = children[0]

            const vnodeElement = {
                type: nodeTypes.ELEMENT,
                tag: vnodeTag,
                props: vnodeProps,
                children: vnodeChildren
            }
            node.codegenNode = vnodeElement
        }
    }


}