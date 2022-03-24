import {readonly} from "../reactive";

describe('test-readonly', () => {
    // readonly 不可以 set
    test('happy path', async () => {
        const originVal:any = {foo:1}
        let readonlyVal = readonly(originVal)
        expect(readonlyVal).not.toBe(originVal)
        expect(readonlyVal.foo).toBe(1)
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
})