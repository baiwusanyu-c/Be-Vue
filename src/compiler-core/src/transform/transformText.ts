import {nodeTypes} from "../ast";
import {isText} from "../utils";

export function transformText(node: any, context: any) {
    if (node.type === nodeTypes.ELEMENT) {
        return () => {
            const {children} = node
            let currentContainer
            // 遍历节点 children，把所有子节点全部收集到 COMPOUND_EXPRESSION 类型节点中（还 添加了 + ）
            // 收集完成后 并把 COMPOUND_EXPRESSION 类型节点 替换成 children
            for (let i = 0; i < children.length; i++) {
                let child = children[i]
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j]
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: nodeTypes.COMPOUND_EXPRESSION,
                                    children: [child]
                                }
                            }
                            currentContainer.children.push(' + ')
                            currentContainer.children.push(next)
                            children.splice(j, 1)
                            j--

                        } else {
                            currentContainer = undefined
                            break;
                        }
                    }
                }
            }
        }
    }
}