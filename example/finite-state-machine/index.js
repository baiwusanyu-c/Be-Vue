// /abc/.test('abc)
// 有限状态机 模拟实现 正则表达式
function test(str) {
    let i = 0;
    let currentState = stateA
    function stateA(c) {
        if(c === 'a'){
            return stateB
        }
        return stateA
    }
    function stateB(c) {
        if(c === 'b'){
            return stateCD
        }
        return stateA
    }
    function stateCD(c) {
        if(c === 'c'){
            return stateEnd
        }
        return stateA
    }
    function stateEnd() {
        return stateEnd
    }
    for(;i<str.length;i++){
        let nextState = currentState(str[i])
        currentState = nextState
        if(currentState === stateEnd){
            return true
        }
    }
    return false
}
console.log(test('abd'))