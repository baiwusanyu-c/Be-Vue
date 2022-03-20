import {track, trigger} from "./effect";

export const reactive = (raw:any) =>{
    return new Proxy(raw,{
        get(target: any, key: string | symbol, receiver: any): any {
            const res = Reflect.get(target,key)
            // 依赖收集
            track(target,key)
            return res
        },
        set(target: any, key: string | symbol, value: any, receiver: any): boolean {
            const res = Reflect.set(target,key,value)
            // 派发通知
            trigger(target,key,value)

            return true
        }
    })
}