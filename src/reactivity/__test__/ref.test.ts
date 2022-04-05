import {isRef, proxyRefs, ref, unRef} from "../ref";
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

    test('proxyRefs',()=>{
        // proxyRefs 能够代理 一个对象中的 ref对象，在template模板中会用到
        // 1.proxyRefs方法返回一个对象，该对象不需要.value即可访问ref对象值
        // 2.通过对proxyRefs方法返回对象进行修改，能够映射到对应ref对象上进行修改
        let foo  = {
            age:ref(10),
            name:'baisan',
        }
        let proxyRef = proxyRefs(foo)
        expect(foo.age.value).toBe(10)
        expect(proxyRef.age).toBe(10)
        expect(proxyRef.name).toBe('baisan')
        proxyRef.age = 20
        expect(foo.age.value).toBe(20)
        expect(proxyRef.age).toBe(20)
        proxyRef.age = ref(18)
        expect(foo.age.value).toBe(20)
        expect(proxyRef.age).toBe(20)

    })
})