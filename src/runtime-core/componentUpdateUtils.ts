export function shouldUpdateComponent(n1: any, n2: any):boolean{

    const {props:nextProps} = n2
    const {props:prevProps} = n1
    for(let key in nextProps){
        if(nextProps[key] !== prevProps[key]){
            return true
        }
    }
    return false
}