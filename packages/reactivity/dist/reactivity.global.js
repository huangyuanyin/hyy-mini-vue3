var VueReactivity = (function (exports) {
  'use strict';

  // 公共方法
  function isObject(target) {
      return target !== null && typeof target === 'object';
  }

  // 1. 定义effect => effect：在视图中获取数据，触发get，收集依赖，数据发生变化，触发set，通知依赖更新
  function effect(fn, options = {}) {
      const effect = createReactEffect(fn, options); // 2.创建响应式effect
      // 3. 判断是否是立即执行的effect
      if (!options.lazy) {
          effect(); // 4.执行effect(默认执行)
      }
      return effect; // 6.返回响应式effect
  }
  let uid = 0; // 定义全局变量
  let activeEffect; // 定义全局变量 => 用于保存当前的effect
  const effectStack = []; // 定义一个栈 => 用于保存effect => 用于解决effect嵌套的问题
  function createReactEffect(fn, options) {
      // 5.创建响应式effect
      const effect = function reactiveEffect() {
          try {
              // 入栈
              effectStack.push(effect); // 3.保存当前的effect
              activeEffect = effect; // 1.保存当前的effect
              fn(); // 6.执行用户的方法
          }
          finally {
              // 出栈
              effectStack.pop(); // 4.删除当前的effect
              activeEffect = effectStack[effectStack.length - 1]; // 保存当前的effect
          }
      };
      effect.id = uid++; // 给effect添加id => 用于区分effect
      effect._isEffect = true; // 给effect添加标识 => 用于判断是否是响应式的effect
      effect.raw = fn; // 给effect添加原始方法 => 用于保存用户的方法
      effect.options = options; // 给effect添加配置项 => 用于保存用户的配置项
      return effect;
  }
  // 收集依赖 在视图中获取数据，触发get，收集依赖
  function Track(target, type, key) {
      console.log(target, type, key, activeEffect);
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

  // state=reactive({name:'zhangsan',age:18})
  function createGetter(isReadonly = false, shallow = false) {
      // target: 目标对象；key: 属性名；receiver: 代理对象
      return function get(target, key, receiver) {
          // 1. 获取属性值
          const res = Reflect.get(target, key, receiver); // Reflect.get() => 获取对象的属性值 => target[key]
          // 2. 判断是否是只读的
          if (!isReadonly) {
              // 如果不是只读的，就进行依赖收集 => 收集依赖，等数据变化后更新视图
              // 收集effect
              // target: 目标对象；type: 操作类型；key: 属性名
              Track(target, 0 /* TrackOpType.GET */, key);
              return res;
          }
          // 3. 判断是否是浅的
          if (shallow) {
              return res;
          }
          // 4. 判断key是否是对象，如果是对象，就返回代理对象（递归）
          // 重点：懒代理：只有当属性值被取值的时候，才会进行代理（提高了性能优化）
          if (isObject(res)) {
              // 5. 如果是对象，就返回代理对象
              return isReadonly ? readonly(res) : reactive(res); // 递归
          }
          // 6. 返回属性值
          return res;
      };
  }
  // set方法
  function createSetter(shallow = false) {
      // target: 目标对象；key: 属性名；value: 属性值；receiver: 代理对象
      return function set(target, key, value, receiver) {
          const res = Reflect.set(target, key, value, receiver); // 获取最新的值 => Reflect.set() => 设置对象的属性值 => target[key] = value
          // Todo: 触发更新
          //返回结果
          return res;
      };
  }
  // get方法
  const get = createGetter(); // 代理对象的get方法 => 不是只读的，是深的，是响应式的
  const shallowGet = createGetter(false, true); // 不是只读的，是浅的，是响应式的
  const readonlyGet = createGetter(true); // 是只读的，是深的，是响应式的
  const shallowReadonlyGet = createGetter(true, true); // 是只读的，是浅的，是响应式的
  // set方法
  const set = createSetter(); // 不是只读的，是深的，是响应式的
  const shallowSet = createSetter(true); // 不是只读的，是浅的，是响应式的
  const reactiveHandlers = {
      get,
      set
  };
  const shallowReactiveHandlers = {
      get: shallowGet,
      set: shallowSet
  };
  const readonlyHandlers = {
      get: readonlyGet,
      set: (target, key, value) => {
          console.warn('set on key "xxx" failed: target is readonly.');
      }
  };
  const shallowReadonlyHandlers = {
      get: shallowReadonlyGet,
      set: (target, key, value) => {
          console.warn('set on key "xxx" failed: target is readonly.');
      }
  };
  // 柯里化
  // let state = { name: '55' }
  // new Proxy(state, {
  //   get() {},
  //   set() {}
  // })
  // vue2中上来会对data中的数据进行递归的遍历，将所有的数据都变成响应式的数据
  // 但是vue3中的proxy => 上来只会对第一层进行代理

  function reactive(target) {
      // target: 目标对象
      // false: 不是只读的`
      // reactiveHandlers: 代理对象
      return createReactiveObject(target, false, reactiveHandlers); // 高阶函数
  }
  function shallowReactive(target) {
      return createReactiveObject(target, false, shallowReactiveHandlers);
  }
  function readonly(target) {
      return createReactiveObject(target, true, readonlyHandlers);
  }
  function shallowReadonly(target) {
      return createReactiveObject(target, true, shallowReadonlyHandlers);
  }
  /*
    实现代理对象的方法
   * 1. target: 目标对象
   * 2. isReadonly: 是否只读
   * 3. baseHandlers: 基础的handlers
   * 4. 返回值：代理对象
   */
  const reactiveMap = new WeakMap(); // 用来存储已经代理过的对象(防止重复代理) => 使用weakMap的好处（key必须是对象，自动的垃圾回收=>不会造成内存泄漏）
  const readonlyMap = new WeakMap();
  function createReactiveObject(target, isReadonly, baseHandlers) {
      // 1. 判断target是否是对象
      if (!isObject(target)) {
          return target;
      }
      // 核心：Proxy
      // 问题优化：如果目标对象已经被代理过了，就不要再次代理了
      const proxyMap = isReadonly ? readonlyMap : reactiveMap; // 代理对象的map
      const proxyEs = proxyMap.get(target); // 代理对象
      // 如果已经代理过了，就直接返回代理对象
      if (proxyEs) {
          return proxyEs;
      }
      const proxy = new Proxy(target, baseHandlers); // proxy => 代理对象(参数一：目标对象，参数二：代理对象) baseHandlers => 处理拦截的对象 {get,set}
      // 将代理对象存储起来
      proxyMap.set(target, proxy);
      return proxy;
  }
  // 4个方法：（1）是不是只读的（2）是不是浅的（代理的时候需不需要嵌套多层）（3）是不是响应式的（4）是不是只读的响应式的
  // 注意：4个方法的核心是proxy => 源码中 采用的是高阶函数中的科里化函数（根据不同的参数来进行处理）

  exports.effect = effect;
  exports.reactive = reactive;
  exports.readonly = readonly;
  exports.shallowReactive = shallowReactive;
  exports.shallowReadonly = shallowReadonly;

  return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
