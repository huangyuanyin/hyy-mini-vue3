// 1. 定义effect
export function effect(fn, options: any = {}) {
  const effect = createReactEffect(fn, options) // 2.创建响应式effect
  // 3. 判断是否是立即执行的effect
  if (!options.lazy) {
    effect() // 4.执行effect(默认执行)
  }
  return effect // 6.返回响应式effect
}

function createReactEffect(fn, options) {
  const effect = function reactiveEffect() {} // 5.创建响应式effect
  fn() // 6.执行用户的方法

  return effect
}
