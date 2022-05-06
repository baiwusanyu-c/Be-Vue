import {h} from '../../lib/be-vue.esm.js'
import ArrayToText from './ArrayToText.js'
import TextToText from './TextToText.js'
import TextToArray from './TextToArray.js'
export const App = {
    // .vue
    setup() {},
    render() {
        return h(
            'div',
            {
                id: `hi be-vue${this.msg}`,
            },
            [
                h(
                    'p',
                    {
                    },
                    `home`
                ),
                h(ArrayToText),
                //h(TextToText),
               //h(TextToArray),
            ]
        )
    }
}