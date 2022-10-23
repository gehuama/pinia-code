// 存放defineStore api
import { getCurrentInstance, inject, effectScope, computed, reactive } from "vue";
import { piniaSymbol } from "./rootStore";
// createPinia(),默认是一个插件具备一个install方法
// _s 用来存储 id =>  store
// state 用来存储所有状态
// _e 用来停止所有状态

// 核心方法
function createSetupStore(id, setup, pinia){
    let scope;
    // 后续一些不是用户定义的属性和方法，内置的api会增加到这个store上
    const store = reactive({});  // store 就是一个响应式对象而已

    // 父scope可以停止所有，setupStore是用户传递的属性和方法
    const setupStore = pinia._e.run(() => {
        scope = effectScope(); // 自己可以停止自己
        return scope.run(() => setup());
    });
    function wrapAction(name, action) {
        return function () {
            let ret = action.apply(store, arguments);
            // action执行后可能是promise
            // todo

            return ret;
        }
    }
    for (let key in setupStore) {
        const prop = setupStore[key];
        if (typeof prop === 'function') { // 你是一个 action
            // 对action中的this和后续的逻辑进行处理，函数劫持
            setupStore[key] = wrapAction(key, prop);
        }
    }
    // pinia._e.stop(); // 停止全部
    // scope.stop() // 只是停止自己
    pinia._s.set(id, store);  // 将store 和 id映射起来
    Object.assign(store, setupStore);
    return store;
}
function createOptionsStore(id, options, pinia) {
    const { state, actions, getters } = options;
    
    function setup() { // 这里面会对用户传递的state, actions, getters 做处理
        const localScope = pinia.state.value[id] = state ? state() : {};
        // getters
        return Object.assign(
            localScope, // 用户的状态
            actions, // 用户的动作
            Object.keys(getters || {}).reduce((memo, name) => {
                // 用户计算属性
                memo[name] = computed(() => {
                    const store = pinia._s.get(id);
                    return getters[name].call(store);
                })
                return memo;
            }, {}));
    }
    createSetupStore(id, setup, pinia);
    
}


// id+options
// options
// id+setup
export function defineStore(idOrOptions, setup) {
    let id;
    let options;
    if (typeof idOrOptions === 'string') {
        id = idOrOptions;
        options = setup;
    } else {
        id = idOrOptions.id;
        options = idOrOptions;
    }
    // 可能setup是一个函数
    const isSetupStore = typeof setup === 'function';

    function useStore() {
        // 这里我们拿到的store，应该是同一个
        let instance = getCurrentInstance();
        const pinia = instance && inject(piniaSymbol);
        if (!pinia._s.has(id)) { // 第一次useStore
            if (isSetupStore) {
                createSetupStore(id, setup, pinia);
            } else {
                // 如果是第一次，则创建映射关系
                createOptionsStore(id, options, pinia);
            }
        }
        // 后续通过id 获取对应的store返回
        const store = pinia._s.get(id);

        return store;
    }
    return useStore; // 用户最终拿到这个store
}