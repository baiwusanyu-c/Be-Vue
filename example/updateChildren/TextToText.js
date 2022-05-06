import {h,ref} from '../../lib/be-vue.esm.js'
const nextC = 'newC'
const prevC = 'prevC'

export default {
    name:'TextToText',
    setup(){
        const isChange = ref(false)
        window.isChange = isChange
        return{
            isChange
        }
    },
    render(){
        const self = this
        return self.isChange === true ?
            h('div',{},nextC)
            :h('div',{},prevC)
    }
}