import {createTextVNode, h} from '../../lib/be-vue.esm.js'
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
                h(foo,
                    {},
                    {
                        // 具名插槽
                        header: () => {
                            return h('p', {}, 'slot-name--header')
                        },
                        body: () => {
                            return [h('p', {}, 'slot-name--body1'), h('p', {}, 'slot-name--body2')]
                        },
                        // 作用域插槽
                        footer: ({name}) => {
                            return h('p', {}, `slot-name--footer__${name}`)
                        }
                    }
                ),

            ]
        )
    }
}