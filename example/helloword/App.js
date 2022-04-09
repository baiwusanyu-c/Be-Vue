import {h} from '../../lib/be-vue.esm.js'
export const App = {
    // .vue
    setup(){

        return {
            msg:'baiwusanyu'
        }
    },
    render(){
        return h('div',
            {
                id:`hi be-vue${this.msg}`,
                class:['aaa','qwdqwdasssssss'],
            },
            [h('div',{id:`hi be-vue${this.msg}c`,class:['ccc']},'aswadda')]
        )
    }
}