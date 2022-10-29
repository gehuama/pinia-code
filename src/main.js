import { createApp, effect, reactive, effectScope } from 'vue'
import App from './App.vue'

// import { createPinia } from '@/pinia'
import { createPinia } from 'pinia'
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

app.use(createPinia()) // 插件要求得有一个install方法

app.mount('#app')
