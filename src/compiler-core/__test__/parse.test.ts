import {baseParse} from '../src/parse'
import {nodeTypes} from "../src/ast";

describe('Parse',()=>{
    describe('interpolation',()=>{
        test('simple interpolation',()=>{
            const ast = baseParse('{{message }}')
            expect(ast.children[0]).toStrictEqual({
                type:nodeTypes.INTERPOLATION,
                content:{
                    type:nodeTypes.SIMPLE_EXPRESSION,
                    content:'message'
                }
            })
        })
    })
    describe('parse Element',()=>{
        test('simple interpolation',()=>{
            const ast = baseParse('<div></div>')
            expect(ast.children[0]).toStrictEqual({
                type:nodeTypes.ELEMENT,
                tag:'div'
            })
        })
    })
})