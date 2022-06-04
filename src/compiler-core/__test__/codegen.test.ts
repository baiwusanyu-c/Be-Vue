
import {baseParse} from '../src/parse'
import {generate} from '../src/codegen'
import {transform} from "../src/transform";
import {transformExpression} from "../src/transform/transformExpression";
import {transformElement} from "../src/transform/transformElement";
import {transformText} from "../src/transform/transformText";
describe('generate',()=>{
    test('string',()=>{
        const ast = baseParse('czh')
        transform(ast)
        const node = generate(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })
    test('interpolation',()=>{
        const ast = baseParse('{{czh}}')
        transform(ast,{
            nodeTransforms:[transformExpression]
        })
        const node = generate(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })
    test('element',()=>{
        const ast = baseParse('<div></div>')
        transform(ast,{
            nodeTransforms:[transformElement]
        })
        const node = generate(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })


    test('compound',()=>{
        const ast = baseParse('<div>czh,{{message}}</div>')
        transform(ast,{
            nodeTransforms:[transformExpression,transformElement,transformText]
        })
        const node = generate(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })
})