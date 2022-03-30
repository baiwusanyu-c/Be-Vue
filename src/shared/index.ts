export const extend = Object.assign
export const isObject = (raw:any):boolean =>{
    return raw !== null && typeof raw === 'object'
}

export const hasChanged =  (val:any,nVal:any):boolean =>{
    return !(Object.is(val,nVal))
}