`Set` 数据类型与 `Map` 数据类型和普通的对象不同，它们有自己的get和set等属性访问或修改方法;
我们使用两种数据类型时，必须是通过这些内置方法来使用的，所以这里的数据劫持和常规对象不同，在我们使用过程中，
可以拆解为两个步骤  
1.访问对对应的方法，例如 `x.size`，此时会触发 `getter` 钩子，并把对应的方法返回  
2.再调用返回的方法 即 `x.size()`,故而我们的依赖收集 `track` 与派发 `trigger`实际上应当在对应的方法执行时进行。  
然后我们需要根据一些方法的性质和功能不同，分别来处理。  
ps：  这里还需要注意的时，在 `size` 方法中会访问 `this.size`,而其他的一些方法例如 `x.set(1)`,他是一个方法，  
我们在使用 `proxy` 进行代理时，操作的是 `proxy`，所以这些方法内部的 `this` 指向永远是代理对象，会导致这些方法使用异常  
处理方法就是针对 `size`  我们在 `getter` 中返回 `reflect.get(target,key,target)` 而其他方法则使用 `bind`,  
返回 `target[key].bind(target)`。
### 访问方法
set:size()√、has、forEach() √
map:get()√、size()√、has、forEach() √
### 修改方法
set:add()、clear()、delete()
map:set()、clear()、delete()
### 迭代器方法
values()、keys()、entries()
#### 其实要实现在方法运行时劫持，vue就是把这些方法都改写了
对于那些`访问方法`，类似于普通对象的 `get` ,他们会对数据进行访问，因此，我们应当在这些方法运行时，`track` 收集那些调用这些方法的副作用函数依赖。
在 `track` 时 则是 `track(target,IERATE_KEY)`.
而对于那些`修改方法`，他们会涉及到值得修改，那么对于的读取方法的副作用也应该运行，这就类似于普通对象的 `set` 因此我们在修改方法中进行 `trigger` 派发
此外，由于 `forEach` 方法的执行，和键值对数量，`set` 大小有关，所以一切可能改变大小的操作的都应当触发 `trigger`,所以在 `forEach` 中也要 `track`
对于那些迭代器方法、或 `for....of` 迭代，他们同样是访问性质的，不用在于他们访问的是对应的迭代器方法，因此这些方法中都应该进行 `track`
具体来说 `entries` 劫持 `entries` 方法，`for....of` 劫持的是迭代器属性 `[Symbol.iterator]`,他和 `entries` 是同一个迭代方法，而 `values()`、`keys()`则各自有自己的方法来实现迭代
同样也是劫持这些对应方法的运行。  
`track` 时，`keys()` 只关心 `key` 变化因此用不同于 `IERATE_KEY` 的另一个 `MAP_KEY_IERATE_KEY` 来进行依赖收集，这样就可以避免当只发生 `key` 变化时，不会触发那些和 `value` 变化相关的依赖


# map 中以下场景会出现数据污染，vue是如何处理的？
````
const m = new Map()

const p1 = reactive(m)
const p2 = ractive(new Map())
p1.set('p2',p2)
effect(()=>{
    console.log(m.get('p2').size)
})
m.get('p2').set('foo',1)
````
上述代码，运行时发现对原始数据进行修改时，`effect` 的副作用运行了，
这是因为在改写 `set` 时， 调用原生 `set` 方法获取结果 `target.set(key,value)`
这里是直接用传递进来的 `value` 进行操作处理，当用户传递进来的是 响应式对象的话，
会导致原始对象 `m.get('p2')` 拿到的是代理对象，此时在 `set` 则会触发 `p2` 的副作用。
解决方法 响应式对象上有一个属性(假设是 `raw` )，而原始对象上是没有的，那么就判断是否有 `raw`
即可即 `target.set(key,value.raw || value)`

### vue3 如何拦截对象的 `in` 操作符 和 `for...in` 循环
`x has obj` 根据es规范，对应的操作函数是 `has` 函数，因此拦截的是 `has` 方法 而非 `get`，
`for...in` 其内部迭代器的生成器方法中使用了 `ownKeys` 方法 因此拦截的是 `ownKeys` 方法
### vue3 如何对数组拦截
1.数组 常规的拦截 索引访问 拦截是 `get`，索引的设置、`length` 的修改 是在 `set` 触发，
这里 `set` 还做了细分，比如区分索引设置值是修改还是新增，新增则会修改 `length`；`length` 的修改，那些大于或等与新 `length` 索引的元素也会受到影响
这些，都是需要根据情况来 `trigger` 的
2.数组的 `for...in` 访问也是拦截 `ownKeys` ，只不过，数组的 这个 `for...in` 与 `length` 有关，所以 `for...in` 的 `track` 是作为 `length` 相关的副作用收集
2.数组的 `for...of` 劫持的是迭代器属性 `[Symbol.iterator]`，这里面访问会访问 索引 和 长度，所以 所以 `for...of` 的 `track` 是作为 `索引 和 长度 相关的副作用收集


















