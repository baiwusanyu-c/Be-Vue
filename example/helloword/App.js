export const App = {
    // .vue
    setup(){

        return {
            msg:'baiwusanyu'
        }
    },
    render(){
        return h('div',`hi be-vue${this.msg}`)
    }
}