import {ReactiveEffect} from "./effect";

/**
 * 1.computed 接受一个方法，该方法内部应该具有访问响应式对象的语句
 * 2.computed 返回一个通过 .value访问的对象，.value会触发 是 computed接受方法，并拿到返回值
 * 3.computed 具有惰性，多次访问 .value，在对应响应式对象值不改变的时候，不会多次触发接受的方法
 * 4.computed 在对应响应式对象值改变的时候，才触发接受的方法
 */

class computedRefsImpl {
    private _effect:ReactiveEffect
    private _getter:Function
    private _isDirty = true // 惰性，控制多次访问时，响应式对象没有改变的话直接返回 _value
    private _value:any
    constructor(getter:Function) {
        this._getter = getter
        // 由于当getter中响应式对象改变时，我们要运行getter，
        // 所以我们使用响应式 effect 对象做依赖收集
        // 并且我们使用effect的调度执行 scheduler 进行调度执行
        // 实现在getter中响应式对象改变时，我们重置 _isDirty
        // 在 .value访问时，真正调度执行 getter
        this._effect = new ReactiveEffect(getter,()=>{
            if(!this._isDirty){
                this._isDirty = true
            }
        })
    }
    get value(){
        if(this._isDirty){
            this._isDirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}

export function computed (getter:Function):computedRefsImpl{
    return new computedRefsImpl(getter)
}