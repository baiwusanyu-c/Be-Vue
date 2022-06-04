
import {baseParse} from '../src/parse'
import {codegen} from '../src/codegen'
import {transform} from "../src/transform";
import {transformExpression} from "../src/transform/transformExpression";
import {transformElement} from "../src/transform/transformElement";
describe('codegen',()=>{
    test('string',()=>{
        const ast = baseParse('czh')
        transform(ast)
        const node = codegen(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })
    test('interpolation',()=>{
        const ast = baseParse('{{czh}}')
        transform(ast,{
            nodeTransforms:[transformExpression]
        })
        const node = codegen(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })
    test('element',()=>{
        const ast = baseParse('<div></div>')
        transform(ast,{
            nodeTransforms:[transformElement]
        })
        const node = codegen(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })

})