import {IEffectOption} from './effect.d'
import {extend} from "../shared";

// 当前激活的副作用函数对象
let activeEffect:ReactiveEffect;
// 是否应该收集依赖 stop功能会用到
let shouldTrack:boolean;


export class ReactiveEffect {
    private _fn:any
    deps:Array<any> = []
    active:boolean = true
    onStop?:()=>void
    constructor(fn:Function,public scheduler?:Function) {
        this._fn = fn
    }
    run(){
        // stop 后 this.active = false,直接return
        // 由于 shouldTrack = false 所以不会 再 track
        if(!this.active){
            return this._fn()
        }

        shouldTrack = true
        activeEffect = this
        const res = this._fn()
        shouldTrack = false
        return res
    }
    stop(){
        if(this.active){
            if(this.onStop){
                this.onStop()
            }
            cleanupEffect(this);
            this.active = false
        }
    }

}
function cleanupEffect(effect:ReactiveEffect) {
    effect.deps.forEach(value => {
        value.delete(effect)
    })
}
export const effect = (fn:Function,options:IEffectOption={}):Function  =>{
    const _effect = new ReactiveEffect(fn,options.scheduler)
    // 降配置传递给 _effect
    extend(_effect,options)
     _effect.run()
    // 给 runner 上挂上自己，stop时使用
    const runner:any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export const stop = (runner:any):void =>{
    runner.effect.stop()
}
let targetMap = new Map()
/**
 * 依赖收集
 * @param target
 * @param key
 */
export const track = (target: any, key: string | symbol) :void =>{
    if(!isTracking()){
        return;
    }
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
    trackEffects(dep)
}
export function trackEffects(dep:any):void {
    if(!dep.has(activeEffect)) {
        // 当前激活的副作用函数对象作为依赖收集起来
        dep.add(activeEffect)
        // 反向收集activeEffect的dep，使得stop时可以找到对应副作用函数
        activeEffect.deps.push(dep)
    }
}
export function isTracking(){
    return shouldTrack && activeEffect !== undefined
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
    triggerEffects(dep)
}
export function triggerEffects(dep:any):void {
    // 将 target 某个key的所有依赖全部执行一遍
    for (let effect of dep){
        if(effect.scheduler){
            effect.scheduler()
        }else{
            effect.run()
        }
    }
}