import { createApp, effect, reactive, effectScope } from 'vue'
import App from './App.vue'

import { createPinia } from '@/pinia'
import { useCounterStore1 } from './stores/counter1';
// import { createPinia } from 'pinia'
const app = createApp(App);
// 基本上咱们js中的插件都是函数
// function createPinia(){
//     return {
//         install(app){

//         }
//     }
// }
// const state = reactive({ name: "畅移" })
// // const e1 = effect(()=>{
// //     console.log(state.name)
// // })
// // const e2 = effect(()=>{
// //     console.log(state.name)
// // })
// // e1.effect.stop();
// // e2.effect.stop();
// const scope1 = effectScope(true) // 独立的
// const scope2 = effectScope(true) // 独立的
// let s = scope1.run(() => {
//     effect(() => {
//         console.log(state.name)
//     })
//     scope2.run(()=>{
//         effect(() => {
//             console.log(state.name)
//         })
//     })
// })
// scope1.stop();
// state.name = "畅展"
// state.name = "畅展1"

// app.use(createPinia()) // 插件要求得有一个install方法
// 使用插件写法
const pinia = createPinia();
pinia.use(function ({ store }) { // 插件就是一个函数，use 是用来注册插件的
    const local = localStorage.getItem(store.$id + "PINIA_STATE");
    if (local) {
        store.$state = JSON.parse(local);
    }
    store.$subscribe(({ storeId: id }, state) => {
        localStorage.setItem(id + "PINIA_STATE", JSON.stringify(state));
    })
    store.$onAction(()=>{ // 埋点

    })
    // 插件的核心就是利用$onAction，$subscribe
    console.log(store);
})

app.use(pinia)
app.mount('#app')


// 异步路由 在任何地方都可以使用
const store = useCounterStore1(); // inject 方法无法使用
console.log(store.count);
