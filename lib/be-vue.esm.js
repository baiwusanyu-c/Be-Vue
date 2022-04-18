const extend = Object.assign;
const isObject = (raw) => {
    return raw !== null && typeof raw === 'object';
};
const isString = (raw) => typeof raw === "string";
const isArray = (raw) => {
    return Array.isArray(raw);
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
const PublicInstanceProxuHandlers = {
    // @ts-ignore
    get({ _: instance }, key, receiver) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
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

let targetMap = new Map();
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

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
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
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxuHandlers);
    // 获取原始组件对象的 setup 方法
    const setup = component.setup;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        // 处理setup结果
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 如果setup结果，是一个对象，就把结果挂载到instance上
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    // 处理渲染函数render具体方法，渲染函数可能来自于模板编译、setup返回、render的option
    finishComponentSetup(instance);
}
// 最后处理渲染函数方法，自此组件setup相关初始化流程结束
function finishComponentSetup(instance) {
    const component = instance.type;
    // 如果组件 instance 上用户render // render 优先级 setup的返回render，组件内option的render，template
    if (component.render) {
        // 就是用用户写的 render的option
        instance.render = component.render;
    }
}

const TEXT = Symbol();
function render(vnode, container) {
    patch(vnode, container);
}
/**
 * patch方法
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
    if (!vnode) {
        return;
    }
    // 根据 vnode 类型不同，进行不同处理
    // 处理 element类型
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    // 处理组件类型
    if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
/**
 * 处理元素方法
 * @param vnode
 * @param container
 */
function processElement(vnode, container) {
    mountElement(vnode, container);
}
/**
 * 挂载元素方法
 * @param vnode
 * @param container
 */
function mountElement(vnode, container) {
    // czh
    let { children, shapeFlag } = vnode;
    if (vnode.type === TEXT) {
        container.textContent = children;
        return;
    }
    const el = (vnode.el = document.createElement(vnode.type));
    // 如果是文本元素就插入
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    // 是数组就递归 patch 子节点
    if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // 处理属性
    const isOn = (key) => { return /on[A-z]/.test(key); };
    const { props } = vnode;
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
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((elm) => {
        // czh
        patch(isString(elm) ? createVNode(TEXT, null, elm) : elm, container);
    });
}
/**
 * 处理组件方法
 * @param vnode
 * @param container
 */
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
/**
 * 挂载组件方法
 * @param vnode
 * @param container
 */
function mountComponent(vnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode);
    // 开始 处理组件setup
    setupComponent(instance);
    // 开始处理 setup 运行完成后内涵的子节点
    // 可以理解初始化时，我们处理的是根节点组件与容器
    // 这里就是处理根组件下的子组件了
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
    // 但是他一定是上一轮的子树
    const subTree = instance.render.call(instance.proxy);
    // 再次 patch，处理子树
    patch(subTree, container);
    // 记录根组件对应的el
    vnode.el = subTree.el;
}

function createVNode(rootComponent, props, children) {
    const vnode = {
        __is_VNode: true,
        type: rootComponent,
        props,
        children,
        shapeFlag: getShapeFlag(rootComponent), // 设置初始时点的 shapeFlag
    };
    // czh
    if (rootComponent === TEXT) {
        vnode.shapeFlag |= 1 /* ELEMENT */;
    }
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

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根据根组件 rootComponent ，创建vnode
            const vnode = createVNode(rootComponent);
            // 调用 render 开始处理 vnode 和 rootContainer 直至最终渲染
            render(vnode, rootContainer);
        }
    };
}

function h(rootComponent, props, children) {
    return createVNode(rootComponent, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        return createVNode('div', {}, slot(props));
    }
}

export { createApp, h, renderSlots };
