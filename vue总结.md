# vue3知识点总结
## reactive 响应式系统
`vue3` 的响应式系统是基于订阅发布者模式，通过 `proxy` 实现对数据的响应式化，    
而依赖副作用的收集就是根据响应式化的数据来进行的。  
<h4 style='color:red'>注意</h4>
这里需要明确的一点，`reactive` 只是做了数据的响应式化处理，使用 `proxy` 代理数据对象，并在 `get`、`set` 中完成了数据访问劫持和数据设置触发依赖。  
`get` 和 `set` 是在有访问或设置操作进行是才会触发的，而 `vue` 的依赖收集实际上是要结合 `effect Api` 进行的。  
例如:

```javascript
let foo = reactive('foo')
let consoleFoo = ()=>{
    console.log(foo)
}
effect(consoleFoo)
```

在上述代码中，首先通过 `reactive` 对 `foo` 做了代理，而 `consoleFoo` 方法则访问了 `foo` 并打印，  
然后在 `effect` 中传入的函数 `consoleFoo`，在这个过程中，`effect` 会运行一遍传入的函数 `consoleFoo`，  
此时 `consoleFoo` 会被当做当前激活依赖存放在全局变量 `activeEffect` 上，而 `consoleFoo` 运行时访问了 `foo`，此时会触发 `get`，从而将当前的  
`activeEffect`（也就是 `consoleFoo`），当做 `foo` 的依赖进行收集。  
### reactive 的基本实现
`reactive API` 的实现其实就是创建并返回了一个 `proxy` 对象，    
将原始数据对象 `raw` 和 `mutableHandlers` 传递给 `proxy` 构造函数，    
完成对象的响应式代理。  
其中 `mutableHandlers` 位于 `baseHandlers.ts` 中，其具体实现中  
`Getter` 实现数据访问劫持:  
`Getter` 接受两个参数 `isReadonly = false`,`isShallow = false`，用于标记是否创建的是 `readonly` 或 `shallow`  
并且 返回了一个 `get` 方法，在 `get` 方法内部
* 首先判断访问的 `key` 是否是 `__v_reactive` 或 `__v_readonly`，并返回（`isReadonly` 和 `isReactive` 实现），
* 然后根据 `Getter` 接受两个参数判断 `isReadonly = false`，则调用 `track` 做依赖收集。
* 判断 `isShallow = true`，直接返回访问目标值 `res`
* 如果访问目标值 `res`是对象，则根据 `isReadonly` 判断递归调用 `readonly Api` 或 `reactive Api` 并传入 `res`  

`setter` 实现数据设置派发更新:  
将访问的目标对象 `target`、设置的 `key`，设置的值传递 `trigger` 方法 派发啊更新  
### effect的基本实现（runner、scheduler、stop）以及依赖收集与触发依赖
#### effect 主流程
`effect` 接受参数 `effect` 接受依赖函数 `fn` 和配置对象（内含调度执行函数 `scheduler` 和 `onStop方法`），  
* 方法内部会通过 `ReactiveEffect` 创建 `_effect` 对象（`_effect` 接受依赖函数fn，和调度执行函数 `scheduler` ），  
* 然后会将 `onStop` 通过 `Object.assign` 拷贝到 `_effect`   
* 执行 `_effect.run` (其实这里就是执行了 依赖函数 `fn`，因为创建 `_effect` 时已经传递进去了)，此时如果 `fn `内部访问了 响应式对象，fn则会当做依赖被收集到对应 响应式对象依赖中。  
* 创建 `runner` `_effect.run.bind(_effect)`）,并把 `_effect` 存在 `runner` 上（实现 `stop` 方法）  
* 返回 `runner`（`_effect.run.bind(_effect)`），用户可以手动通过 `runner` 触发依赖，  
#### ReactiveEffect 对象
```javascript
_fn // 依赖函数
deps = [] // 依赖函数集合
active = true // 是否激活
onStop = ()=>{} // stop 钩子方法
```
首先依赖收集有全局变量 `activeEffect`（当前激活的 `effec` t对象，内含副作用依赖），`shouldTrack`（是否需要收集）  
`ReactiveEffect` 对象还包含一个 `run` 方法 和 `stop` 方法,    
在构造方法时，`_fn` 会缓存当前传入的依赖函数 `fn`，
当外部调用 `run` 方法时，`run` 方法内部会先判断  `active === false`,    
命中则直接返回 依赖函数执行结果 `this._fn()`；    
否则 `shouldTrack` 设置为 `true`  
就把 `activeEffect` 指向当前 `ReactiveEffect` 对象（用于 `track` 时收集），  
执行结果 `res = this._fn()；`  
`shouldTrack` 设置为 `false`
最后返回 `res`
  
当外部调用 `stop` 方法时，`stop` 方法内部会先判断  `active === true`,  
然后判断是否传入了 `onStop` 钩子函数，有就运行 `onStop`。然后清除依赖，并把 `active = false`,  
<h4 style='color:red'>注意</h4>
`stop` 方法想要实现的效果其实是 `stop` 后，清空收集的依赖并不在收集、不执行副作用函数，需要手动调用 `runner`，  
这个效果实际上是通过 `shouldTrack` 和 `this.active` 实现的    
正常情况下 `run` 方法运行，`shouldTrack` 设置为 `true` ，然后执行 `this._fn()`，在这个 `this._fn()` 过程中会触发 `track` 做依赖收集，    
而 `track` 会判断 `shouldTrack`，为 `false` 直接返回不收集，
正常流程 `shouldTrack = true =》this._fn() =》 track 收集 =》shouldTrack = false`，
注意此流程走完后依赖收集完毕是 `false` 的， 而在调用 `stop` 方法后因为 `this.active` 变为 `false`，`run` 方法运行他会直接返回 `this._fn()` 的结果，不会在设置
`shouldTrack = true`，于是在 `track` 时会被直接返回捕收剂。
#### stop方法Api
`stop`方法`Api`，传入一个 `runner`，当 `trigger` 后 ，不执行副作用函数，需要手动调用 `runner`，
其内部就是通过传入的 `runner` 访问都 `effect` 对象，并调用 `effect` 对象上的 `stop` 方法

#### track
先判断 `shouldTrack`，为 `false` 直接返回不收集
全局维护了一个 `targetMap`，`key` 是响应式原始对象 `target`，值是 `depsMap`。
`depsMap`的 `key` 是 `target` 中的各个 `key`，值是一个 `deps`（本质是 `Set` ），  
`deps` 中每个元素是都对应这这个 `key` 的一个 `activeEffect`（ `ReactiveEffect` 对象，依赖函数 `fn` 实际上就存储在 `ReactiveEffect` 的 `_fn`上）
`track` 方法主要是对上述数据结构的一些维护，比如没有就创建，有就获取，最终创建或找到对应 `target` 的对应 `key` 的依赖集合 `deps`，然后调用 `trackEffects` 把 `activeEffect` 收集到 `deps` 中，
值得注意的时 `trackEffects` 还反向收集 `activeEffect.deps.push(dep)`，在清除依赖时使用
#### trigger
从 `depsMap` 中找到对应 `target` 对应 `key` 的 `deps`，并传递给 `triggerEffects` 调用
`triggerEffects` 循环遍历 `dep` 拿到每个 `effect` 对象 调用 `run` 或 `scheduler`
#### scheduler 的调度执行
`scheduler` 的调度执行，通常会在一些调度优化、计算属性 `compute` 中会使用到，其表现出来的效果是
1. `effect` 支持传入一个包含名为 `scheduler` 函数的 `options`
2.`effect` 首次执行时，传入给 `effect` 的`fn`（即依赖）执行
3.当对应响应式对象 `set` 并 `trigger` 时，不执行 `fn`（即依赖） 而执行 `options` 的 `scheduler` 函数
4.当执行 `runner` 时（`effect` 的返回） 能够执行 `fn`（即依赖）

其实现就是在 `trigger` 时  `triggerEffects` 变量依赖集合 `dep` 并调用里面依赖对象时，判断依赖对象 `effect` 是否
有 `scheduler` 有就执行否则就执行run来执行依赖函数 `fn`
<h4 style='color:red'>注意</h4>
`scheduler` 调度执行只是没有执行 `fn` 而是执行了 `scheduler`，但是响应式数据对象的值是改变了的

### readonly 的基本实现
与 `reactive` 相似，只是创建 `proxy` 时传入的 `Getter` 的 `isReadonly` 为 `true`
这使得在触发 `get` 做依赖收集时，不再执行 `track` ，
`set` 直接返回 `true`，不修改值，实现 只读 与 不收集依赖。
### shallowReadonly 的基本实现
与 `reactive` 相似，只是创建 `proxy` 时传入的 `Getter` 的 `isReadonly` 为 `true`，`isShallow` 为 `true`  
这使得在触发 `get` 做依赖收集时，不再执行 `track` ，然后先判断 `isShallow` 命中 直接返回，不做递归执行 `reactive` 或 `readonly`  
### isReadonly 的基本实现
接受一个 `target` 作为参数，访问 `target` 上的 `__v_readonly` 属性，这会触发 `get` 
在 `get` 中 判断是否访问的 key 是 `__v_readonly`，命中 则返回 `isReadonly`（`readonly(obj)` 时，传入给 `Getter` 为 `true`）
### isReactive 的基本实现 
接受一个 `target` 作为参数，访问 `target` 上的 `__v_reactive` 属性，这会触发 `get`
在 `get` 中 判断是否访问的 key 是 `__v_reactive`，命中 则返回 `!isReadonly`（`readonly(obj)` 时，传入给 `Getter` 为 `true`）
### isProxy 的基本实现
接受一个 `target` 作为参数，返回 `isReactive(target) || isReadonly(target)`
### ref 的基本实现
ref 的出现与设计 是因为 reactive 是基于 proxy 实现 get 、set 来实现数据的访问劫持与设置派发更新，这是针对对象而言的，而对于基本数据对象类型
String、Boolean、Number等，则需要对包装一层对象，再通过 proxy 来实现数据的访问劫持与设置派发更新。
ref 实际上是 创建并返回了一个 refImpl 对象
#### refImpl
```javascript
_value // 当前值
_rawValue // 原始值
dep = new Set() // 依赖集合 
__v_isRef = true // 是否是 ref 对象标识
```
构造函数运行时，会先判断传入是否为对象，是则先用 `reactive` 处理一遍，然后把他们存在 `_value` 上，`_rawValue` 存储一开始的 `_value`，  
`refImpl` 的 `get` 方法 实现数据劫持，直接调用 `trackEffects` 依赖收集  
`refImpl` 的 `set` 方法 实现数据设置派发更新，判断根据 `_rawValue` 数据是否变化，   
判断新值是否为对象，是则先用 `reactive` 处理一遍，  
然后把他们存在 `_value` 上，`_rawValue` 存储一开始的 `_value`，  
`triggerEffects` 派发更新
### proxyRefs 的基本实现，实现ref的访问代理
`proxyRefs` 能够代理 一个对象中的 `ref` 对象，在 `template` 模板中会用到
1.`proxyRefs` 方法返回一个对象，该对象不需要`.value`即可访问 `ref` 对象值
2.通过对 `proxyRefs` 方法返回对象进行修改，能够映射到对应 `ref` 对象上进行修改
其本质是返回一个 代理 `ref` 的 `proxy` 代理对象
在 `get` 中 判断访问的 `target` 是否是 `ref`，是这返回 `res.value`，否则返回 `res`
在 `set` 中 判断访问的 `target` 是否是 `ref` 且 新值不是 `ref`，则直接 `targetVal.value = 新值`，否则直接 `targetVal = 新值`
### compute计算属性的基本实现
1.`computed` 接受一个方法 `fn` ，该方法内部应该具有访问响应式对象的语句
2.`computed` 返回一个通过 `.value`访问的对象，`.value`会触发 `computed` 接受方法 `fn`，并拿到返回值
3.`computed` 具有惰性，多次访问 `.value`，在对应响应式对象值不改变的时候，不会多次触发接受的方法
4.`computed` 在对应响应式对象值改变的时候，访问 `.value`,才触发接受的方法 `fn`
其本质是内部创建了一个 `computedRefsImpl` 对象，把 `fn` 传递给构造函数
在构造时，会把 `fn` 通过 `ReactiveEffect` 创建一个 `effect` 对象 放在 `this.effect` 中，并传入调度执行方法 `scheduler`
在 `scheduler` 方法内部会修改 `computedRefsImpl` 对象 上的属性 `this._isDirty = true`，这样响应式值改变时不会触发更新
在 `get` 方法内部 `this._isDirty = true`，则重置 `this._isDirty = false`，并调用 `this.effect.run()` 触发更新，返回更新后的值
<h4 style='color:red'>注意</h4>
`computed` 返回的值，在 `.value` 访问时，由于没有进行 `set` 操作，故 `_isDirty = false`，不会在 `get` 中执行 `this._effect.run()`，
而由于是调度执行，在给 `fn` 里的响应式对象赋值后，会触发 `scheduler`，`_isDirty = true`，在在 `.value` 访问时get中执行 `this._effect.run()`
从而实现惰性，
此外这里是 直接调用 `ReactiveEffect` 而不是 `effect Api`，所以 `fn` 不会先执行一次
### watch 监听属性的基本实现
<hr>  

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
### 基于`parse`有限状态机基本理解
### Transformer 基本流程原理
`Transformer` 被设计为只控制主流程，具体的转换实现，由传入的转换方法实现，这是一种可拔插的插件设计模式，能够使得 `Transformer` 足够解耦灵活，实现不同环境下的转换
### generate 基本流程原理
`generate` 的本质，其实就是根据`transform`处理过的`ast`进行解析，生成对应的`JavaScript`代码字符串

### compiler 编译模块如何在 runtime 运行时模块中使用
`runtime` 运行时模块 导出了一个注册编译函数`registryRuntimeCompiler`,
在`vue`的入口文件 `index` 中调用 `registryRuntimeCompiler` 并传入一个方法 `compileToFunction`
通过注册编译函数 `registryRuntimeCompiler`,`compileToFunction` 将在 被存储在运行时全局变量 
`compiler`上,`compiler`则会在 `finishComponentSetup` 中被调用,最后获得 `render` 方法挂载在组件实例
`instance.render`上。
在`compileToFunction` 内部将传递进来的 `template` 传递给编译模块 的 `baseCompile` 方法最终会得到 `code`，
在使用 `new Function('vue',code)(runtimeDom) `得到 `render` 函数。
其中 `baseCompile` 函数由 编译模块 `index` 导出，其内部分别调用 `baseParse`、`transform`、`generate`.
