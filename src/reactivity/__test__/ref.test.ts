import {isRef, ref, unRef} from "../ref";
import {effect} from "../effect";
import {reactive} from "../reactive";

describe('test-effect', () => {
    test('happy path', () => {
        const foo = ref(1)
        expect(foo.value).toBe(1)
    })
    test('ref is reactive', () => {
        const foo = ref(1)
        let exp:number = 0
        let exmp
        effect(()=>{
            exp++
            exmp = foo.value
        })
        expect(exp).toBe(1)
        expect(exmp).toBe(1)
        foo.value = 2
        expect(exmp).toBe(2)
        expect(exp).toBe(2)
        // 同样值不触发trigger
        foo.value = 2
        expect(exmp).toBe(2)
        expect(exp).toBe(2)
    })
    // 处理 接受对象情况
    test('ref nested reactvie', () => {
        const foo = ref({asd:1})

        let exmp
        effect(()=>{

            exmp = foo.value.asd
        })
        expect(exmp).toBe(1)
        foo.value.asd = 2
        expect(exmp).toBe(2)

    })

    test('isRef',()=>{
        const foo = ref(1)
        const reactiveFoo = reactive({foo:1})
        expect(isRef(foo)).toBe(true)
        expect(isRef(1)).toBe(false)
        expect(isRef(reactiveFoo)).toBe(false)
    })
    test('unRef',()=>{
        const foo = ref(1)
        expect(unRef(foo)).toBe(1)
        expect(unRef(1)).toBe(1)
    })
})