import {reactive} from "../reactive";
import {computed} from "../computed";

describe('test-computed', () => {
    test('happy path', () => {
        const foo = reactive({
            age:18
        })
        const computeFoo = computed(()=>{
            return foo.age
        })
        expect(computeFoo.value).toBe(18)
    })

    test('should compute lazily', () => {
        const foo = reactive({
            age:18
        })
        const getter = jest.fn(()=>{
            return foo.age
        })
        const computeFoo = computed(getter)
        // 没访问 computeFoo.value 的话，getter 不执行
        expect(getter).not.toHaveBeenCalled()

        // 访问了 就会执行一次 getter
        expect(computeFoo.value).toBe(18)
        expect(getter).toHaveBeenCalledTimes(1)

        // foo.age 没变，访问了只会会执行一次 getter
        computeFoo.value
        expect(getter).toHaveBeenCalledTimes(1)

        // foo.age 变，访问了，会执行一次 getter
        foo.age = 20
        expect(getter).toHaveBeenCalledTimes(1)
        expect(computeFoo.value).toBe(20)
        expect(getter).toHaveBeenCalledTimes(2)

        computeFoo.value
        // foo.age 没变，访问了只会会执行一次 getter
        expect(getter).toHaveBeenCalledTimes(2)
    })
})