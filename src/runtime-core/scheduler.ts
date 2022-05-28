let p = Promise.resolve()
let queue = new Array()
let isFlushPending = false

export function nextTick(fn:any) {
    return fn ? p.then(fn) : p
}
export function queueJobs(c:any):void {
    if(!queue.includes(queue)){
        queue.push(queue)
    }
    
}
export function queueFlush() {
    // 首次触发时，isFlushPending 设置为true
    //  多次触发时，只添加到任务队列，然后到这里旧直接返回
    // 任务执行完后再设置为false，避免多次调用 flushJobs
    if(isFlushPending) return
    isFlushPending = true
    nextTick(flushJobs)
}
export function flushJobs(){
    isFlushPending = false
    let jobs
    while ((jobs = queue.shift())){
        jobs && jobs()
    }
}