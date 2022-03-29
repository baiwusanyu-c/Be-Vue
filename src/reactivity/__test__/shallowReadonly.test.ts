import { isReadonly,shallowReadonly} from "../reactive";

describe('test-shallowReadonly', () => {
    // shallow 是指表层的处理 例如只讲表层的对象或数组做 readonly 化或 reactive 化
    test('shallowReadonly', async () => {
        const originVal:any = {
            foo:{
                fooC:1
            }
        }
        let shallowReadonlyVal = shallowReadonly(originVal)
        expect(shallowReadonlyVal).not.toBe(originVal)
        expect(isReadonly(shallowReadonlyVal)).toBe(true)
        expect(isReadonly(shallowReadonlyVal.foo)).toBe(false)
    })
})