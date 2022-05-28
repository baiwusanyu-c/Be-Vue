import {h,ref} from '../../lib/be-vue.esm.js'
import {Child} from './Child.js'
export const App = {
    // .vue
    setup() {
        const msg = ref('123')
        const count = ref(1)
        const changeChildProps = () =>{
            msg.value = '456'
        }
        window.msg = msg
        const changeCount = () =>{
            count.value++
        }
        return {
            changeChildProps,
            msg,
            count,
            changeCount
        }
    },
    render() {
        return h(
            'div',
            {
                id: `hi be-vue`,
            },
            [
                h(
                    'button',
                    {
                        onClick:this.changeChildProps
                    },
                    `changeChildProps`
                ),
                h(
                    Child,
                    {
                        msg:this.msg
                    },
                ),
                h(
                    'button',
                    {
                        onClick:this.changeCount
                    },
                    `changeCount`
                ),
                h(
                    'p',
                    {

                    },
                    `${this.count}`
                ),
            ]
        )
    }
}