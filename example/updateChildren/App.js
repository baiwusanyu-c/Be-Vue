import {h} from '../../lib/be-vue.esm.js'
import ArrayToText from './ArrayToText.js'
import TextToText from './TextToText.js'
import TextToArray from './TextToArray.js'
import ArrayToArray from './ArrayToArray.js'
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
                h(ArrayToArray),
                //h(TextToText),
               //h(TextToArray),
            ]
        )
    }
}