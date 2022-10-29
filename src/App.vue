<script setup>
import { useCounterStore1 } from "./stores/counter1";
import { useCounterStore2 } from "./stores/counter2";
const store1 = useCounterStore1();
const handleClick1 = ()=>{
  // store1.increment(3)
  store1.$patch({count: 2000}) // setState({})
  // store1.count ++;
  // store1.count ++;
  // store1.count ++;
}
const handleReset = ()=>{
  store1.$reset();
}
const handleDispose = () =>{
  store1.$dispose(); // scope.run 收集的effect的 scope.stop 是停止effect
}
const handleDisposeAll = () =>{
  // store1._p._e.stop(); // 我们可以终止所有effect, pinia API中没有提供该方法
}
const store2 = useCounterStore2();
const handleClick2 = ()=>{
  store2.increment(3)
}
store2.$subscribe(function(storeInfo, state){ // 状态变化
  console.log(storeInfo,state);
})
// 此方法是发布订阅
store2.$onAction(function({after, onError}){ // 方法操作
  console.log("action running", store2.count);
  after(()=>{
    console.log("action after", store2.count);
  })
  onError((err)=>{
    console.log("action error", err);
  })
})
</script>

<template>
  —————————————options————————————<br />
  {{ store1.count }}/
  {{ store1.double }}
  <button @click="handleClick1">修改状态</button>
  <button @click="handleReset">重置状态</button>
  <button @click="handleDispose">卸载响应式</button>
  <hr color="red" />
  —————————————setup——————————————<br />
  {{ store2.count }}/
  {{ store2.double }}
  <button @click="handleClick2">修改状态</button>
  <button @click="handleDisposeAll">终止所有</button>
</template>

<style scoped>

</style>
