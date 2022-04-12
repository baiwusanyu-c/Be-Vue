import {h} from '../../lib/be-vue.esm.js'
import foo from "./foo.js";
console.log(foo)
window.self = null
export const App = {
    // .vue
    setup() {

        return {
            msg: '-baiwusanyu'
        }
    },
    render() {
        window.self = this
        return h(
            'div',
            {
                id: `hi be-vue${this.msg}`,
                class: ['aaa', 'qwdqwdasssssss'],
                onClick() {
                    console.log('click')
                }
            },
            [
                h(
                    'div',
                    {
                        id: `hi be-vue${this.msg}c`, class: ['ccc']
                    },
                    'tesa'
                ),
                h(foo,{count:1})
            ]
        )
    }
}