import {h,ref} from '../../lib/be-vue.esm.js'
export const App = {
    // .vue
    setup() {
        const count = ref(0)
        const handleClick = () =>{
            count.value++
        }
        return {
            handleClick,
            count
        }
    },
    render() {
        return h(
            'div',
            {
                id: `hi be-vue${this.msg}`,
                class: ['aaa', 'qwdqwdasssssss'],
            },
            [
                h(
                    'div',
                    {
                        id: `hi be-vue${this.msg}c`, class: ['ccc']
                    },
                    `${this.count}`
                ),
                h(
                    'button',
                    {
                        id: `hi be-vue${this.msg}c`, class: ['ccc'],
                        onClick:this.handleClick
                    },
                    `$click`
                ),
            ]
        )
    }
}