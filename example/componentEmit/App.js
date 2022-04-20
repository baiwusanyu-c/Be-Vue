import {h,createTextVNode} from '../../lib/be-vue.esm.js'
import foo from "./foo.js";
console.log(foo)
window.self = null
export const App = {
    // .vue
    setup() {
        return {}
    },
    render() {
        window.self = this
        return h(
            'div',
            {
                id: `hi be-vue${this.msg}`,
                class: ['aaa', 'qwdqwdasssssss'],
            },
            [
                createTextVNode('ComponentEmit'),
                h(foo,{
                    onAdd(...data){
                        console.log('emit onAdd',...data)
                    },
                    onAddFoo(...data){
                        console.log('emit onAddFoo',...data)
                    }
                }),

            ]
        )
    }
}