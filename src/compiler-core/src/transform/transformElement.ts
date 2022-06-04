import {createVNodeCall, nodeTypes} from "../ast";
import {CREATE_ELEMENT_VNODE} from "../runtimeHelpers";

export function transformElement(node: any, context: any) {
    if (node.type === nodeTypes.ELEMENT) {
        return () => {
            // 处理tag
            let vnodeTag = `'${node.tag}'`
            // 处理 props
            let vnodeProps
            const children = node.children
            let vnodeChildren = children[0]
            node.codegenNode = createVNodeCall(context,vnodeTag,vnodeProps,vnodeChildren)
        }
    }


}