// 1. 定义effect => effect：在视图中获取数据，触发get，收集依赖，数据发生变化，触发set，通知依赖更新
export function effect(fn, options: any = {}) {
  const effect = createReactEffect(fn, options) // 2.创建响应式effect
  // 3. 判断是否是立即执行的effect
  if (!options.lazy) {
    effect() // 4.执行effect(默认执行)
  }
  return effect // 6.返回响应式effect
}

let uid = 0 // 定义全局变量
let activeEffect // 定义全局变量 => 用于保存当前的effect
const effectStack = [] // 定义一个栈 => 用于保存effect => 用于解决effect嵌套的问题

function createReactEffect(fn, options) {
  // 5.创建响应式effect
  const effect = function reactiveEffect() {
    try {
      // 入栈
      effectStack.push(effect) // 3.保存当前的effect
      activeEffect = effect // 1.保存当前的effect
      fn() // 6.执行用户的方法
    } finally {
      // 出栈
      effectStack.pop() // 4.删除当前的effect
      activeEffect = effectStack[effectStack.length - 1] // 保存当前的effect
    }
  }
  effect.id = uid++ // 给effect添加id => 用于区分effect
  effect._isEffect = true // 给effect添加标识 => 用于判断是否是响应式的effect
  effect.raw = fn // 给effect添加原始方法 => 用于保存用户的方法
  effect.options = options // 给effect添加配置项 => 用于保存用户的配置项
  return effect
}

// 收集依赖 在视图中获取数据，触发get，收集依赖
export function Track(target, type, key) {
  console.log(target, type, key, activeEffect)
}

// 问题 (1) effect 是一个树形结构
// effect(() => {
//   // effect1
//   state.name // 收集的effect1
//   effect(() => {
//     // effect2
//     state.age // 收集的effect2
//   })
//   state.a // 收集的effect1
// })
