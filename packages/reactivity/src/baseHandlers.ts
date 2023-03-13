import { isObject } from '@vue/shared'
import { reactive, readonly } from './reactive'

// state=reactive({name:'zhangsan',age:18})
function createGetter(isReadonly = false, shallow = false) {
  // target: 目标对象；key: 属性名；receiver: 代理对象
  return function get(target, key, receiver) {
    // 1. 获取属性值
    const res = Reflect.get(target, key, receiver) // Reflect.get() => 获取对象的属性值 => target[key]
    // 2. 判断是否是只读的
    if (!isReadonly) {
      // 如果不是只读的，就进行依赖收集
      return res
    }
    // 3. 判断是否是浅的
    if (shallow) {
      return res
    }
    // 4. 判断key是否是对象，如果是对象，就返回代理对象（递归）
    // 重点：懒代理：只有当属性值被取值的时候，才会进行代理（提高了性能优化）
    if (isObject(res)) {
      // 5. 如果是对象，就返回代理对象
      return isReadonly ? readonly(res) : reactive(res) // 递归
    }
    // 6. 返回属性值
    return res
  }
}

const get = createGetter() // 代理对象的get方法 => 不是只读的，是深的，是响应式的
const shallowGet = createGetter(false, true) // 不是只读的，是浅的，是响应式的
const readonlyGet = createGetter(true) // 是只读的，是深的，是响应式的
const shallowReadonlyGet = createGetter(true, true) // 是只读的，是浅的，是响应式的

export const reactiveHandlers = {
  get
}
export const shallowReactiveHandlers = {
  get: shallowGet
}
export const readonlyHandlers = {
  get: readonlyGet
}
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet
}

// 柯里化
// let state = { name: '55' }
// new Proxy(state, {
//   get() {},
//   set() {}
// })
// vue2中上来会对data中的数据进行递归的遍历，将所有的数据都变成响应式的数据
// 但是vue3中的proxy => 上来只会对第一层进行代理
