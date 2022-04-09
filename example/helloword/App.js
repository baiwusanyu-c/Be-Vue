import {h} from '../../lib/be-vue.esm.js'
window.self = null
export const App = {
    // .vue
    setup(){

        return {
            msg:'-baiwusanyu'
        }
    },
    render(){
        window.self = this
        return h('div',
            {
                id:`hi be-vue${this.msg}`,
                class:['aaa','qwdqwdasssssss'],
            },
            [h('div',{id:`hi be-vue${this.msg}c`,class:['ccc']},'aswadda')]
        )
    }
}