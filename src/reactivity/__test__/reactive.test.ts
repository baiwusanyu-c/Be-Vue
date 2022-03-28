import {isReactive, reactive} from "../reactive";
describe('reactive',()=>{
    test('happy path',()=>{
        const original = {foo:1}
        const observed = reactive(original)
        expect(original).not.toBe(observed)
        expect(observed.foo).toBe(1)
        expect(isReactive(observed)).toBeTruthy()
    })
    test('nested reactive',()=>{
        const original = {
            foo:1,
            child:{
                foo:1
            },
            arr:[{foo:1}]
        }
        const observed = reactive(original)
        expect(original).not.toBe(observed)
        expect(observed.foo).toBe(1)
        expect(isReactive(observed)).toBeTruthy()
        expect(isReactive(observed.child)).toBeTruthy()
        expect(isReactive(observed.arr)).toBeTruthy()
        expect(isReactive(observed.arr[0])).toBeTruthy()
    })
})