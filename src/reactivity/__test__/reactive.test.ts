import {isReactive, reactive} from "../reactive";
describe('reactive',()=>{
    test('happy path',()=>{
        const original = {foo:1}
        const observed = reactive(original)
        expect(original).not.toBe(observed)
        expect(observed.foo).toBe(1)
        expect(isReactive(observed)).toBeTruthy()
    })
})