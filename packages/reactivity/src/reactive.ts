import { isObject } from '@vue/shared'
import { reactiveHandlers, shallowReactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'

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
  实现代理对象的方法
 * 1. target: 目标对象
 * 2. isReadonly: 是否只读
 * 3. baseHandlers: 基础的handlers
 * 4. 返回值：代理对象
 */
const reactiveMap = new WeakMap() // 用来存储已经代理过的对象(防止重复代理) => 使用weakMap的好处（key必须是对象，自动的垃圾回收=>不会造成内存泄漏）
const readonlyMap = new WeakMap()
function createReactiveObject(target, isReadonly, baseHandlers) {
  // 1. 判断target是否是对象
  if (!isObject(target)) {
    return target
  }
  // 核心：Proxy
  // 问题优化：如果目标对象已经被代理过了，就不要再次代理了
  const proxyMap = isReadonly ? readonlyMap : reactiveMap // 代理对象的map
  const proxyEs = proxyMap.get(target) // 代理对象
  // 如果已经代理过了，就直接返回代理对象
  if (proxyEs) {
    return proxyEs
  }
  const proxy = new Proxy(target, baseHandlers) // proxy => 代理对象(参数一：目标对象，参数二：代理对象) baseHandlers => 处理拦截的对象 {get,set}
  // 将代理对象存储起来
  proxyMap.set(target, proxy)
  return proxy
}

// 4个方法：（1）是不是只读的（2）是不是浅的（代理的时候需不需要嵌套多层）（3）是不是响应式的（4）是不是只读的响应式的
// 注意：4个方法的核心是proxy => 源码中 采用的是高阶函数中的科里化函数（根据不同的参数来进行处理）
