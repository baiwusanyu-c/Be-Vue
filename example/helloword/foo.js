import {h} from "../../lib/be-vue.esm.js";

export default {
    setup(props){
        console.log(props.count)
        // props is shallowReadonly
        props.count++
    },
    render(){
        return h('div', {
            class:'foo'
        },`foo:${this.count}`)
    }
}