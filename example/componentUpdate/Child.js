import {h} from '../../lib/be-vue.esm.js'
export const Child = {
    // .vue
    setup() {

    },
    render() {
        return h(
            'div',
            {

            },
            `hi be-vue ${this.$props.msg}`,
        )
    }
}