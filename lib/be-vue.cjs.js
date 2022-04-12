'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (raw) => {
    return raw !== null && typeof raw === 'object';
};
const isString = (raw) => typeof raw === "string";
const isArray = (raw) => {
    return Array.isArray(raw);
};

function createVNode(rootComponent, props, children) {
    const vnode = {
        type: rootComponent,
        props,
        children,
        shapeFlag: getShapeFlag(rootComponent), // 设置初始时点的 shapeFlag
    };
    if (isString(vnode.children)) {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    if (isArray(vnode.children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
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

const publicPropertiesMap = {
    $el: (i) => { return i.vnode.el; }
};
const PublicInstanceProxuHandlers = {
    // @ts-ignore
    get({ _: instance }, key, receiver) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type,
        setupState: {}, // setup的返回结果对象
    };
}
function setupComponent(instance) {
    // 初始化处理 props
    // initProps
    // 初始化处理插槽
    // initSlots
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
        const setupResult = setup();
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

function render(vnode, container) {
    patch(vnode, container);
}
/**
 * patch方法
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
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
    const el = (vnode.el = document.createElement(vnode.type));
    let { children, shapeFlag } = vnode;
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
        patch(elm, container);
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

exports.createApp = createApp;
exports.h = h;
