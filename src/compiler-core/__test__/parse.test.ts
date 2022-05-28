import {baseParse} from '../src/parse'

describe('Parse',()=>{
    describe('interpolation',()=>{
        test('simple interpolation',()=>{
            const ast = baseParse('{{message }}')
            expect(ast.children[0]).toStrictEqual({
                type:'interpolation',
                content:{
                    type:'simple_expression',
                    content:'message'
                }
            })
        })
    })
})