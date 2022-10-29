// 存放defineStore api
import { getCurrentInstance, inject, effectScope, computed, reactive, isRef, isReactive, toRefs, watch } from "vue";
import { piniaSymbol } from "./rootStore";
import { addSubscription, triggerSubscriptions } from "./subscribe";
// createPinia(),默认是一个插件具备一个install方法
// _s 用来存储 id =>  store
// state 用来存储所有状态
// _e 用来停止所有状态

function isComputed(v) { // 计算属性是ref 也是effect
  return !!(isRef(v) && v.effect)
}

function isObject(value) {
  return typeof value === 'object' && value === null;
}
// 递归合并两个对象
function mergeReactiveObject(target, state) {
  for (let key in state) {
    let oldValue = target[key];
    let newValue = state[key]; // 这里循环的时候 拿出来就丧失了响应式
    if (isObject(oldValue) && isObject(newValue)) {
      target[key] = mergeReactiveObject(oldValue, newValue);
    } else {
      target[key] = newValue;
    }
  }
  return target;
}

// 核心方法
function createSetupStore(id, setup, pinia, isOption) {
  let scope;
  // $patch 1. 通过对象进行合并 2. 直接给它一个函数让其去执行，用户拿到这个状态去更新
  function $patch(partialStateOrMutation) {
    if (typeof partialStateOrMutation === 'object') {
      // 用新的状态和并来的状态
      console.log(pinia.state.value[id], partialStateOrMutation);
      mergeReactiveObject(pinia.state.value[id], partialStateOrMutation);
    } else {
      partialStateOrMutation(pinia.state.value[id]);
    }
  }
  let actionSubscriptions = [];
  const partialStore = {
    $patch,
    $subscribe(callback, options = {}) {
      // 每次状态变化都会触发此函数
      scope.run(()=>{
        watch(pinia.state.value[id], (state) => {
          callback({ storeId: id }, state)
        }, options)
      })
    },
    $onAction:addSubscription.bind(null, actionSubscriptions)
  }

  // 后续一些不是用户定义的属性和方法，内置的api会增加到这个store上
  const store = reactive(partialStore);  // store 就是一个响应式对象而已
  const initialStore = pinia.state.value[id]; // 对于setup API 没有初始化过状态
  if (!initialStore && !isOption) { // setup API
    pinia.state.value[id] = {}
  }
  // 父scope可以停止所有，setupStore是用户传递的属性和方法
  const setupStore = pinia._e.run(() => {
    scope = effectScope(); // 自己可以停止自己
    return scope.run(() => setup());
  });
  function wrapAction(name, action) {
    return function () {
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      // after订阅
      function after(callback){
        afterCallbackList.push(callback);
      }
      // onError订阅
      function onError(callback){
        onErrorCallbackList.push(callback);
      }
      // 执行前
      triggerSubscriptions(actionSubscriptions, {after, onError});
      let ret
      try {  // 用户调用action函数时会报错
        ret = action.apply(store, arguments);
        // 执行后
        triggerSubscriptions(afterCallbackList, ret);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
      }
      if(ret instanceof Promise){ // action 可以写成promise
        return ret.then((value)=>{
          // 执行后
          triggerSubscriptions(afterCallbackList, value);
        }).catch((error)=>{
          // 执行错误
          triggerSubscriptions(onErrorCallbackList, error);
        })
      }
      return ret;
    }
  }
  for (let key in setupStore) {
    const prop = setupStore[key];
    if (typeof prop === 'function') { // 你是一个 action
      // 对action中的this和后续的逻辑进行处理，函数劫持
      setupStore[key] = wrapAction(key, prop);
    }
    // 如何看这个值是不是状态
    // computed 也是 ref
    if (isRef(prop) || !isComputed(prop) || isReactive(prop)) {
      if (!isOption) {
        pinia.state.value[id][key] = prop;
      }
    }
  }
  // console.log(pinia.state.value);
  // pinia._e.stop(); // 停止全部
  // scope.stop() // 只是停止自己
  pinia._s.set(id, store);  // 将store 和 id映射起来
  Object.assign(store, setupStore);
  return store;
}
function createOptionsStore(id, options, pinia) {
  const { state, actions, getters } = options;

  function setup() { // 这里面会对用户传递的state, actions, getters 做处理
    pinia.state.value[id] = state ? state() : {};
    const localScope = toRefs(pinia.state.value[id]); // 我们需要将状态转化成ref 普通值是没有响应式的 需要转换成ref才具备响应式

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
  const store = createSetupStore(id, setup, pinia, true);
  store.$reset = function () {
    const newState = state ? state() : {}
    store.$patch((state) => {
      Object.assign(state, newState); // 默认状态覆盖到老状态
    })
  }
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