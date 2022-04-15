export const extend = Object.assign
export const isObject = (raw:any):boolean =>{
    return raw !== null && typeof raw === 'object'
}
export const isString = (raw:any)=> typeof raw === "string"
export const isArray = (raw:any):boolean =>{
    return Array.isArray(raw)
}


export const hasChanged =  (val:any,nVal:any):boolean =>{
    return !(Object.is(val,nVal))
}

export const hasOwn = (val:any,key:string):boolean => Object.prototype.hasOwnProperty.call(val,key)

export const toHandlerKey = (str:string) =>{
    return str ? `on${capitalize(str)}`:'';
}
export const capitalize = (str:string) =>{
    return str.charAt(0).toUpperCase() + str.slice(1)
}
export const camelize = (str:string) =>{
    return str.replace(/-(\w)/g,(_,c):string=>{
        return c ? c.toUpperCase() : ''
    })
}