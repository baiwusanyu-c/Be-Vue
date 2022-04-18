import {h,renderSlots} from "../../lib/be-vue.esm.js";

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
        const renderP = h(
            'p',
            {},
            'test slot')
        return h(
            'div',
            {
                class: 'foo',
            },
            [
                renderP,
                renderSlots(_this.$slots,'header', {}),
                renderSlots(_this.$slots,'body', {}),
                renderSlots(_this.$slots,'footer', {name:'baiwusanyu'})])
    }
}