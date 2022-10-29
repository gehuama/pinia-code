// import { defineStore } from "@/pinia";
import { defineStore } from "pinia";
// defineStore中的id是独一无二的
// {counter => state, xxx => state}
export const useCounterStore1 = defineStore("counter",
{
    // vuex 在前端用的是对象 在ssr中是函数
    state: ()=>{
        return {
            count: 0
        }
    },
    getters: {
        double(){
            return this.count * 2;
        }
    },
    actions: {
        increment(payload){
            this.count += payload;
        }
    }
});

// options API => composition API