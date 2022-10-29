# pinia 的特点
- pinia 用来取代vuex的， pinia非常小巧，支持vue2 也支持vue3 ts类型支持非常好。再使用pinia之后不用写类型
- pinia 默认支持多仓库 vuex典型的单仓库 $store.state 会导致所有的状态都放到一个store里，模块来区分不同的store 
    - store.state.a 产生了一个a模块，树状结构不好维护 store.state.a.b.c.xx
    - 默认不采用命名空间的方式来管理 拍平，每个状态都可以是单独的store(useStore.xxx productStore.xx)
    - 用起来很方便， store直接也可以相互调用
- pinia vuex中所有的状态 组件=》（action=》mutation-》） 状态，action 这一层的诞生是为了什么
    - 组件=》action（commit(mutation) => 
                    commit(mutation) => 
                    commit(mutation) => 
                    commit(mutation) => 
                    commit(mutation) =>）commit(mutation) =>状态 
            action起到的作用和行就是封装
    - 组件 点击按钮 setTimeout  =》commit（mutation）=》状态
- pinia 所有的更改 都只有action了 没有mutation 只有action层没有mutation
了
- 扁平化 多个 store，没有mutation了，支持ts 小 支持devtool
- vue2 辅助函数mapState mapGetters mapActions 都支持


# 实现功能
- createOptionStore（内部会拿到用户的选项将他变成 setup 语法）createSetupStore（用户传递的就是setup可以直接使用）
- 修改状态 可以通过 .xxx = 新值 action 来修改
-$patch 
-$reset (值支持optionsAPI) 将状态重置默认方法
-$subscribe(监听状态变化，将状态存到本地中)
