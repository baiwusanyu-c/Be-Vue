import {h,ref} from '../../lib/be-vue.esm.js'
export const App = {
    // .vue
    setup() {
        const count = ref(0)
        const data = ref({
            foo:'foo',
            bar:'bar'
        })
        const handleClick = () =>{
            count.value++
        }
        const setNewFoo = () =>{
            data.value.foo = 'new Foo'
        }
        const setNullFoo = () =>{
            data.value.foo = undefined
        }
        const setRemoveBar = () =>{
            data.value = {
                foo:'foo',
            }
        }
        return {
            setNullFoo,
            handleClick,
            setNewFoo,
            setRemoveBar,
            data,
            count
        }
    },
    render() {
        return h(
            'div',
            {
                id: `hi be-vue${this.msg}`,
                foo:this.data.foo,
                bar:this.data.bar,
                class: ['aaa', 'qwdqwdasssssss'],
            },
            [
                h(
                    'button',
                    {
                        id: `hi be-vue${this.msg}c`, class: ['ccc'],
                        onClick:this.handleClick
                    },
                    `$click`
                ),
                h(
                    'button',
                    {
                        id: `hi be-vue${this.msg}cc`, class: ['ccc'],
                        onClick:this.setNewFoo
                    },
                    `the Value is changed`
                ),
                h(
                    'button',
                    {
                        id: `hi be-vue${this.msg}ac`, class: ['ccc'],
                        onClick:this.setNullFoo
                    },
                    `the Value is Null or Undefined`
                ),
                h(
                    'button',
                    {
                        id: `hi be-vue${this.msg}sc`, class: ['ccc'],
                        onClick:this.setRemoveBar
                    },
                    `the old Value is removed`
                ),
            ]
        )
    }
}