import {isProxy, isReadonly, readonly} from "../reactive";

describe('test-readonly', () => {
    // readonly 不可以 set
    test('happy path', async () => {
        const originVal:any = {foo:1}
        let readonlyVal = readonly(originVal)
        expect(readonlyVal).not.toBe(originVal)
        expect(readonlyVal.foo).toBe(1)
        expect(isReadonly(readonlyVal)).toBeTruthy()
        expect(isProxy(readonlyVal)).toBeTruthy()
        expect(isProxy(originVal)).not.toBeTruthy()
    })
    test('warn then call set', async () => {
        const originVal:any = {foo:1}
        let readonlyVal = readonly(originVal)
        console.warn = jest.fn()
        expect(readonlyVal).not.toBe(originVal)
        expect(readonlyVal.foo).toBe(1)
        readonlyVal.foo = 2
        expect(console.warn).toBeCalled()
    })
    test('nested readonly',()=>{
        const original = {
            foo:1,
            child:{
                foo:1
            },
            arr:[{foo:1}]
        }
        const observed = readonly(original)
        expect(original).not.toBe(observed)
        expect(observed.foo).toBe(1)
        expect(isReadonly(observed)).toBeTruthy()
        expect(isReadonly(observed.child)).toBeTruthy()
        expect(isReadonly(observed.arr)).toBeTruthy()
        expect(isReadonly(observed.arr[0])).toBeTruthy()
    })
})