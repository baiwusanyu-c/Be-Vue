

// 当前激活的副作用函数对象
let activeEffect:ReactiveEffect;
class ReactiveEffect {
    private _fn:any
    constructor(fn:Function) {
        this._fn = fn
    }
    run(){
        activeEffect = this
        this._fn()
    }

}
export const effect = (fn:Function):void  =>{
    const _effect = new ReactiveEffect(fn)
    _effect.run()
}
let targetMap = new Map()
/**
 * 依赖收集
 * @param target
 * @param key
 */
export const track = (target: any, key: string | symbol) :void =>{
    let depsMap = targetMap.get(target)
    if(!depsMap){
        depsMap = new Map()
        targetMap.set(target,depsMap)
    }
    let dep = depsMap.get(key)
    if(!dep){
        dep = new Set()
        depsMap.set(key,dep)
    }
    // 当前激活的副作用函数对象作为依赖收集起来
    dep.add(activeEffect)
}
/**
 * 通知派发
 * @param target
 * @param key
 * @param value
 */
export const trigger = (target: any, key: string | symbol, value: any) :void =>{
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    // 将 target 某个key的所有依赖全部执行一遍
    for (let effect of dep){
        effect.run()
    }
}