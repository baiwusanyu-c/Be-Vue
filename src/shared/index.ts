export const extend = Object.assign
export const isObject = (raw:any):boolean =>{
    return raw !== null && typeof raw === 'object'
}