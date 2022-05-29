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
        test('simple Element',()=>{
            const ast = baseParse('<div></div>')
            expect(ast.children[0]).toStrictEqual({
                type:nodeTypes.ELEMENT,
                tag:'div',
                children:[]
            })
        })
    })
    describe('parse Text',()=>{
        test('simple Text',()=>{
            const ast = baseParse('some text')
            expect(ast.children[0]).toStrictEqual({
                type:nodeTypes.TEXT,
                content:'some text'
            })
        })
    })
    describe('happy path',()=>{
        test('three case one',()=>{
            const ast = baseParse('<p>czh,{{message}}</p>')
            expect(ast.children[0]).toStrictEqual({
                type:nodeTypes.ELEMENT,
                tag:'p',
                children:[
                    {
                        type:nodeTypes.TEXT,
                        content:'czh,'
                    },
                    {
                        type:nodeTypes.INTERPOLATION,
                        content:{
                            type:nodeTypes.SIMPLE_EXPRESSION,
                            content:'message'
                        }
                    }
                ]

            })
        })
        test('nested element',()=>{
            const ast = baseParse('<div><p>czh,</p>{{message}}</div>')
            expect(ast.children[0]).toStrictEqual({
                type:nodeTypes.ELEMENT,
                tag:'div',
                children:[
                    {
                        type:nodeTypes.ELEMENT,
                        tag:'p',
                        children:[
                            {
                                type:nodeTypes.TEXT,
                                content:'czh,'
                            }
                        ]
                    },
                    {
                        type:nodeTypes.INTERPOLATION,
                        content:{
                            type:nodeTypes.SIMPLE_EXPRESSION,
                            content:'message'
                        }
                    }
                ]

            })
        })

        test('should throw err when lack end tag',()=>{

            expect(()=>{
                baseParse('<div><p></div>')
            }).toThrow(`lack the end tag p`)
        })
    })
})