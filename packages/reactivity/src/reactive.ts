const reactiveHandlers = {}
const shallowReactiveHandlers = {}
const readonlyHandlers = {}
const shallowReadonlyHandlers = {}

export function reactive(target) {
  // target: 目标对象
  // false: 不是只读的`
  // reactiveHandlers: 代理对象
  return createReactiveObject(target, false, reactiveHandlers) // 高阶函数
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}
/*
 * 1. target: 目标对象
 * 2. isReadonly: 是否只读
 * 3. baseHandlers: 基础的handlers
 * 4. 返回值：代理对象
 */
function createReactiveObject(target, isReadonly, baseHandlers) {}

// 4个方法：（1）是不是只读的（2）是不是浅的（代理的时候需不需要嵌套多层）（3）是不是响应式的（4）是不是只读的响应式的
// 注意：4个方法的核心是proxy => 源码中 采用的是高阶函数中的科里化函数（根据不同的参数来进行处理）
