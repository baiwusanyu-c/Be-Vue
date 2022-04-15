import {h} from "../../lib/be-vue.esm.js";

export default {
    setup(props, {emit}) {
        const handleClick = () => {
             emit('add', 1, 2)
             emit('add-foo', 1, 2)
        }
        return {
            handleClick
        }
    },
    render() {
        const _this = this
        const renderBtn = h(
            'button',
            {
                onClick() {
                    _this.handleClick()
                }
            },'test emit')
        return h(
            'div',
            {
                class: 'foo',
            },
            [renderBtn])
    }
}