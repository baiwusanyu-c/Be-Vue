function createVNode(rootComponent, props, children) {
    return {
        type: rootComponent,
        props,
        children
    };
}

const isObject = (raw) => {
    return raw !== null && typeof raw === 'object';
};

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type, // 这个是原始组件对象
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
        instance.setupResult = setupResult;
    }
    // 处理渲染函数render具体方法，渲染函数可能来自于模板编译、setup返回、render的option
    finishComponentSetup(instance);
}
// 最后处理渲染函数方法，自此组件setup相关初始化流程结束
function finishComponentSetup(instance) {
    const component = instance.type;
    // 如果组件 instance 上用户render
    if (component.render) {
        // 就是用用户写的 render的option
        instance.render = component.render;
    }
}

function render(vnode, container) {
    patch(vnode);
}
/**
 * patch方法
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
    // 根据 vnode 类型不同，进行不同处理
    // 处理组件类型
    processComponent(vnode);
}
/**
 * 处理组件方法
 * @param vnode
 * @param container
 */
function processComponent(vnode, container) {
    mountComponent(vnode);
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
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    // 调用render函数，拿到子树vnode，这个值可能是组件也可能是元素或其他，
    // 但是他一定是上一轮的子树
    const subTree = instance.render();
    // 再次 patch，处理子树
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根据根组件 rootComponent ，创建vnode
            const vnode = createVNode(rootComponent);
            // 调用 render 开始处理 vnode 和 rootContainer 直至最终渲染
            render(vnode);
        }
    };
}

function h(rootComponent, props, children) {
    return createVNode(rootComponent, props, children);
}

export { createApp, h };
