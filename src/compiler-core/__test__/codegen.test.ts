
import {baseParse} from '../src/parse'
import {codegen} from '../src/codegen'
import {transform} from "../src/transform";
describe('codegen',()=>{
    test('string',()=>{
        const ast = baseParse('czh')
        transform(ast)
        const node = codegen(ast)
        // 快照测试
        expect(node).toMatchSnapshot()
    })

})