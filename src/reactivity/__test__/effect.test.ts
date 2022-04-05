import {effect, stop} from "../effect";
import {reactive} from "../reactive";

describe('test-effect', () => {
    test('happy path', async () => {
        const user = reactive({
            age:10
        })
        let nextAge;
        effect(()=>{
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)
        user.age++
        expect(nextAge).toBe(12)
    })
    test('effect runner', async () => {
        // 执行effect，能够返回一个runner的，runner是一个fn
        // 当执行runner 时，能够直接执行传入给effect的fn（即依赖），并拿到fn的执行结果
        // 在计算属性compute中会用到
        const test = reactive({
            foo:1
        })
        let effectTest:number = 0;
        const runner = effect(()=>{
            effectTest = effectTest + test.foo + 1
            return 'runner'
        })
        expect(effectTest).toBe(2)
        let res = runner()
        expect(effectTest).toBe(4)
        expect(res).toBe('runner')
    })

    test('effect scheduler', async () => {
        // effect 的调度执行,在计算属性compute中会用到
        // 1. effect 支持传入一个包含名为 scheduler 函数的 options
        // 2.effect 首次执行时，传入给effect的fn（即依赖）
        // 3.当对应响应式对象 set 并trigger时，不执行 fn（即依赖） 而执行 options 的 scheduler 函数
        // 4.当执行runner时（effect的返回） 能够执行fn（即依赖）

        const test = reactive({
            foo:1
        })
        let run:any
        const scheduler = jest.fn(()=>{
            run = runner
        })
        let testScheduler = 0
        const runner = effect(()=>{
            testScheduler =  test.foo
            return 'scheduler'
        },{scheduler})
        expect(scheduler).not.toHaveBeenCalled()
        expect(testScheduler).toBe(1)
        test.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(testScheduler).toBe(1)
        expect(run === runner).toBeTruthy()
        let res = run()
        expect(res).toBe('scheduler')
        expect(testScheduler).toBe(2)

    })
    test('effect stop', async () => {
        // stop方法，传入一个runner，当trigger后 ，不执行副作用函数，需要手动调用runner
        // 通过在effect对象上挂载stop方法，在方法内部清空对应deps依赖实现
        const test = reactive({
            foo:1
        })
        let testStop:number = 0
        const runner = effect(()=>{
            testStop =  test.foo
            return 'stop'
        })
        test.foo = 2
        expect(test.foo).toBe(2)
        expect(testStop).toBe(2)
        stop(runner)
        test.foo ++
        expect(testStop).toBe(2)
        runner()
        expect(testStop).toBe(3)

    })
    test('effect onStop', async () => {
        // onStop 调用stop时的钩子函数
        const test = reactive({
            foo:1
        })
        const onStop = jest.fn()
        let testOnStop:number = 0
        const runner = effect(()=>{
            testOnStop =  test.foo
            return 'onStop'
        },{onStop})
        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    })
})