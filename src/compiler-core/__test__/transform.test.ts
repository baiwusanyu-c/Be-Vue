import {baseParse} from '../src/parse'
import {nodeTypes} from "../src/ast";
import {transform} from "../src/transform";
describe('transform',()=>{
        test('happy path',()=>{
            const ast = baseParse('<div>czh {{message}}</div>')
            const plugin = {
                nodeTransforms:[(node:any)=>{
                    if(node.type === nodeTypes.TEXT){
                        node.content = node.content + 'cool'
                    }
                }]
            }
            transform(ast,plugin)
            const textContent = ast.children[0].children[0].content
            expect(textContent).toBe('czh cool')
        })

})