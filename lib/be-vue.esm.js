const extend = Object.assign;
const isObject = (raw) => {
    return raw !== null && typeof raw === 'object';
};
const isString = (raw) => typeof raw === "string";
const isArray = (raw) => {
    return Array.isArray(raw);
};
const hasChanged = (val, nVal) => {
    return !(Object.is(val, nVal));
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const toHandlerKey = (str) => {
    return str ? `on${capitalize(str)}` : '';
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};

const publicPropertiesMap = {
    $el: (i) => { return i.vnode.el; },
    $slots: (i) => { return i.slots; }
};
const PublicInstanceProxyHandlers = {
    // @ts-ignore
    get({ _: instance }, key, receiver) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

// 当前激活的副作用函数对象
let activeEffect;
// 是否应该收集依赖 stop功能会用到
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        // stop 后 this.active = false,直接return
        // 由于 shouldTrack = false 所以不会 再 track
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            if (this.onStop) {
                this.onStop();
            }
            cleanupEffect(this);
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach(value => {
        value.delete(effect);
    });
}
const effect = (fn, options = {}) => {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // 降配置传递给 _effect
    extend(_effect, options);
    _effect.run();
    // 给 runner 上挂上自己，stop时使用
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
};
let targetMap = new Map();
/**
 * 依赖收集
 * @param target
 * @param key
 */
const track = (target, key) => {
    if (!isTracking()) {
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
};
function trackEffects(dep) {
    if (!dep.has(activeEffect)) {
        // 当前激活的副作用函数对象作为依赖收集起来
        dep.add(activeEffect);
        // 反向收集activeEffect的dep，使得stop时可以找到对应副作用函数
        activeEffect.deps.push(dep);
    }
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
/**
 * 通知派发
 * @param target
 * @param key
 * @param value
 */
const trigger = (target, key, value) => {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
};
function triggerEffects(dep) {
    // 将 target 某个key的所有依赖全部执行一遍
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const createGetter = (isReadonly = false, isShallow = false) => {
    return function get(target, key, receiver) {
        // 根据参数确定是否为readonly
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        // readonly 只能读，不会set 不trigger 也就不需要 track
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        // shallowReadonly 或 shallowReactive 都直接返回
        if (isShallow) {
            return res;
        }
        // 处理存在子对象获子数组情况，递归调用
        // 深readonly和深reactive
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
};
const createSetter = () => {
    return function set(target, key, value, receiver) {
        Reflect.set(target, key, value);
        // 派发通知
        trigger(target, key);
        return true;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGetter = createGetter(true);
const shallowReadonlyGetter = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGetter,
    set(target, key, value, receiver) {
        console.warn('readonlyHandlers');
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGetter,
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_reactive";
    ReactiveFlags["IS_READONLY"] = "__v_readonly";
})(ReactiveFlags || (ReactiveFlags = {}));
const reactive = (raw) => {
    return createActiveObject(raw, mutableHandlers);
};
const readonly = (raw) => {
    return createActiveObject(raw, readonlyHandlers);
};
const shallowReadonly = (raw) => {
    return createActiveObject(raw, shallowReadonlyHandlers);
};
const createActiveObject = (raw, baseHandlers) => {
    return new Proxy(raw, baseHandlers);
};

function emit(instance, event, ...arg) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...arg);
}

function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & 16 /* SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slot) {
    for (let key in children) {
        const value = children[key];
        slot[key] = (props) => normalizeSlots(value(props));
    }
}
function normalizeSlots(value) {
    return isArray(value) ? value : [value];
}

class refImpl {
    constructor(value) {
        this.dep = new Set();
        this.__v_isRef = true;
        this._value = convert(value);
        this._rawValue = this._value;
    }
    get value() {
        if (isTracking()) {
            // 依赖收集
            trackEffects(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._value = convert(newValue);
            this._rawValue = this._value;
            // 派发更新
            triggerEffects(this.dep);
        }
    }
}
const convert = (value) => {
    return isObject(value) ? reactive(value) : value;
};
function ref(raw) {
    return new refImpl(raw);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function proxyRefs(rawWithRefs) {
    return new Proxy(rawWithRefs, {
        get(target, key) {
            // 当访问的值是ref对象，返回.value，否则直接返回
            const res = Reflect.get(target, key);
            return isRef(res) ? res.value : res;
        },
        set(target, key, value, receiver) {
            // 当设置的值是ref，且新值不是ref
            let targetVal = Reflect.get(target, key);
            if (isRef(targetVal) && !isRef(value)) {
                targetVal.value = value;
            }
            else {
                targetVal = value;
            }
            return true;
        }
    });
}

function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: (event, ...arg) => { },
        slots: {}
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    // 初始化处理 props
    // initProps
    initProps(instance, instance.vnode.props);
    // 初始化处理插槽
    initSlots(instance, instance.vnode.children);
    // 创建一个有状态的组件
    setStatefulComponent(instance);
}
function setStatefulComponent(instance) {
    // 获取原始组件对象（注意这里并不是组件实例）
    const component = instance.type;
    // 创建要给组件实例代理，使得render方法内能够通过this访问组件实例,如this.$el等
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    // 获取原始组件对象的 setup 方法
    const setup = component.setup;
    if (setup) {
        // ao yong setup qian  she zhi instance
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(instance);
        // 处理setup结果
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 如果setup结果，是一个对象，就把结果挂载到instance上
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    if (typeof setupResult === "function") {
        // 如果返回的是 function 的话，那么绑定到 render 上
        // 认为是 render 逻辑
        // setup(){ return ()=>(h("div")) }
        instance.render = setupResult;
    }
    else if (typeof setupResult === "object") {
        // 返回的是一个对象的话
        // 先存到 setupState 上
        // 先使用 @vue/reactivity 里面的 proxyRefs
        // 后面我们自己构建
        // proxyRefs 的作用就是把 setupResult 对象做一层代理
        // 方便用户直接访问 ref 类型的值
        // 比如 setupResult 里面有个 count 是个 ref 类型的对象，用户使用的时候就可以直接使用 count 了，而不需要在 count.value
        // 这里也就是官网里面说到的自动结构 Ref 类型
        instance.setupState = proxyRefs(setupResult);
    }
    // 处理渲染函数render具体方法，渲染函数可能来自于模板编译、setup返回、render的option
    finishComponentSetup(instance);
}
// 最后处理渲染函数方法，自此组件setup相关初始化流程结束
function finishComponentSetup(instance) {
    const component = instance.type;
    // 如果组件 instance 上用户render
    // render 优先级 setup的返回render，组件内option的render，template
    if (!instance.render) {
        instance.render = component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const TEXT = Symbol('TEXT');
const FRAGMENT = Symbol('FRAGMENT');
function createVNode(type, props, children) {
    const vnode = {
        __is_VNode: true,
        type: type,
        props,
        children,
        shapeFlag: getShapeFlag(type), // 设置初始时点的 shapeFlag
    };
    if (isString(vnode.children)) {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    if (isArray(vnode.children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    // 判断slots
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (isObject(vnode.children)) {
            vnode.shapeFlag |= 16 /* SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    if (isString(type)) {
        return 1 /* ELEMENT */;
    }
    if (isObject(type)) {
        return 2 /* STATEFUL_COMPONENT */;
    }
}
function createTextVNode(children) {
    return createVNode(TEXT, {}, children);
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 根据根组件 rootComponent ，创建vnode
                const vnode = createVNode(rootComponent);
                // 调用 render 开始处理 vnode 和 rootContainer 直至最终渲染
                render(null, vnode, rootContainer);
            }
        };
    };
}

function createRenderer(option) {
    const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert } = option;
    function render(n1, n2, container) {
        patch(n1, n2, container, null);
    }
    /**
     * patch方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function patch(n1, n2, container, parent) {
        if (!n2) {
            return;
        }
        // 根据 vnode 类型不同，进行不同处理
        // 处理 element类型
        const { shapeFlag, type } = n2;
        switch (type) {
            case TEXT:
                processText(n1, n2, container);
                break;
            case FRAGMENT:
                processFragment(n1, n2, container, parent);
                break;
            default: {
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parent);
                }
                // 处理组件类型
                if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parent);
                }
            }
        }
    }
    /**
     * 处理元素方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function processElement(n1, n2, container, parent) {
        if (!n1) {
            console.log('init Element');
            mountElement(n2, container, parent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    /**
     * 更新元素方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     */
    function patchElement(n1, n2, container) {
        console.log('patch Element');
        console.log('n1');
        console.log(n1);
        console.log('n2');
        console.log(n2);
    }
    /**
     * 挂载元素方法
     * @param vnode
     * @param container
     * @param parent
     */
    function mountElement(vnode, container, parent) {
        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = hostCreateElement(vnode.type));
        let { children, shapeFlag } = vnode;
        // 如果是文本元素就插入
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        // 是数组就递归 patch 子节点
        if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parent);
        }
        // 处理属性
        const { props } = vnode;
        hostPatchProps(el, props);
        // insert the el to container
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parent) {
        vnode.children.forEach((elm) => {
            patch(null, elm, container, parent);
        });
    }
    /**
     * 处理组件方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function processComponent(n1, n2, container, parent) {
        mountComponent(n2, container, parent);
    }
    /**
     * 挂载组件方法
     * @param vnode
     * @param container
     * @param parent
     */
    function mountComponent(vnode, container, parent) {
        // 创建组件实例
        const instance = createComponentInstance(vnode, parent);
        // 开始 处理组件setup
        setupComponent(instance);
        // 开始处理 setup 运行完成后内涵的子节点
        // 可以理解初始化时，我们处理的是根节点组件与容器
        // 这里就是处理根组件下的子组件了
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
            // 但是他一定是上一轮的子树
            const subTree = instance.render.call(instance.proxy);
            // 初始化逻辑
            if (!instance.isMounted) {
                instance.subTree = subTree;
                // 再次 patch，处理子树
                patch(null, subTree, container, instance);
                // 记录根组件对应的el
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新逻辑
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                // 再次 patch，处理子树
                patch(prevSubTree, subTree, container, instance);
                // 记录根组件对应的el
                vnode.el = subTree.el;
            }
        });
    }
    /**
     * 处理fragment
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parent
     */
    function processFragment(n1, n2, container, parent) {
        mountChildren(n2, container, parent);
    }
    /**
     * 处理文本方法
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     */
    function processText(n1, n2, container) {
        const { children } = n2;
        const text = n2.el = document.createTextNode(children);
        container.append(text);
    }
    return {
        createApp: createAppApi(render)
    };
}

function h(rootComponent, props, children) {
    return createVNode(rootComponent, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        return createVNode(FRAGMENT, {}, slot(props));
    }
}

function provide(key, val) {
    var _a;
    const instance = getCurrentInstance();
    if (instance) {
        let { provides } = instance;
        let parentProvides = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (provides === parentProvides) {
            // 这里要解决一个问题
            // 当父级 key 和 爷爷级别的 key 重复的时候，对于子组件来讲，需要取最近的父级别组件的值
            // 那这里的解决方案就是利用原型链来解决
            // provides 初始化的时候是在 createComponent 时处理的，当时是直接把 parent.provides 赋值给组件的 provides 的
            // 所以，如果说这里发现 provides 和 parentProvides 相等的话，那么就说明是第一次做 provide(对于当前组件来讲)
            // 我们就可以把 parent.provides 作为 currentInstance.provides 的原型重新赋值
            // 至于为什么不在 createComponent 的时候做这个处理，可能的好处是在这里初始化的话，是有个懒执行的效果（优化点，只有需要的时候在初始化）
            provides = instance.provides = Object.create(parentProvides);
        }
        provides[key] = val;
    }
}
function inject(key, defaultVal) {
    const instance = getCurrentInstance();
    if (instance) {
        let provides = instance.parent.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultVal) {
            if (typeof defaultVal === 'function') {
                return defaultVal();
            }
            else {
                return defaultVal;
            }
        }
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, props) {
    const isOn = (key) => {
        return /on[A-z]/.test(key);
    };
    for (let key in props) {
        let val = props[key];
        // 处理事件
        if (isOn(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
}
function insert(el, container) {
    container.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createAppApi, createRenderer, createTextVNode, effect, getCurrentInstance, h, inject, provide, ref, renderSlots };
