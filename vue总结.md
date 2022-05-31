# vue知识点总结
## reactive 响应式系统
### reactive 的基本实现
### effect的基本实现（runner、scheduler、stop）以及依赖收集与触发依赖
### readonly的基本实现
### ref的基本实现
### proxyRefs的基本实现，实现ref的访问代理
### compute计算属性的基本实现
### watch 监听属性的基本实现
## runtime-core 运行时核心-初始化
### component组件的基本初始化流程
### 普通dom的Element元素基本初始化流程
### 组件代理对象的基本实现
### shapeFlags的基本实现，使用二进制来做判断标志
### 实现组件的事件注册、props
### 实现组件的emit功能
### 实现组件slot插槽
### 实现Fragment 片段与Text文本类型节点
### 实现getCurrentInstance
### 实现组件的provide-inject
### 实现自定义渲染器custom renderer
## runtime-core 运行时核心-更新
### element更新基本流程
### 更新 element的 props
### 更新 element 的 children 基本场景
### 更新 element 的 children 的新旧数组场景 - 双端快速diff算法
### 最大递增子序列算法
### vue2的diff算法基本原理
### 组件类型的更新
### nextTick原理
场景：当用户短时间内多次触发响应式更新逻辑，比如循环改变一个响应式对象，视图更新。  
在这个场景中，视图更新逻辑会被多次触发，而这可以优化为等待循环结束，再触发更新逻辑。  
此时就需要将视图更新逻辑作为一个微任务来调用，等待循环结束，再调用视图更新逻辑，一次性更新视图。
这个优化的逻辑基本实现思路是基于`effect`的`scheduler`实现和`Promise`的，通过创建一个微任务队列 `queue`,
在执行视图更新逻辑时候，调用 `effect` 并传入 `scheduler`，在 `scheduler中` 将 `effect` 返回的 `runner` 作为任务存入微任务队列
`queue`，然后再`Promise`中循环队列 `queue`，执行 `runner` 更新视图。  
这种优化使得视图更新逻辑变为了异步，但是在某些场景下用户需要拿到更新后的一些组件实例或者做一些其他操作，此时就诞生了 `nextTick`
，它的基本原理其实就是把传入的回调函数放在微任务或者宏任务中执行，但是它内部做了`Api`的使用判断，判断当前浏览器是否支持`Promise`然后降级调用 `Api`，比如不支持就调用 `setTimeout`，`messageChannel` 这种。
## compiler-core 
### 主要流程
template -》parse(str){ `词法分析 -》语法分析` } =》 模板AST -》 Transformer -》 JavaScript Ast -》代码生成 （generate JSAST）-》渲染函数
### 有限状态机基本理解