// 通过rollup 进行打包

// 1. 引入相关依赖
import { createRequire } from 'node:module' // 创建require方法
import ts from 'rollup-plugin-typescript2' // 解析ts
import json from '@rollup/plugin-json' // 解析json
import resolvePlugin from '@rollup/plugin-node-resolve' // 解析第三方模块
import path from 'path' // 处理路径
import { fileURLToPath } from 'url' // 处理路径

// fix:__dirname is not defined in ES module scope
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// fix:require is not defined in ES module scope
const require = createRequire(import.meta.url) // 创建require方法

// 2 获取文件路径
const packagesDir = path.resolve(__dirname, 'packages') // 获取packages目录

// 3.1 获取打包的目标（获取需要打包的包）
const packageDir = path.resolve(packagesDir, process.env.TARGET)

// 3.2 打包获取到 每个包的项目配置文件
const resolve = (p) => path.resolve(packageDir, p) // 获取每个包的路径
const pkg = require(resolve('package.json')) // 获取每个包的package.json
const name = path.basename(packageDir) // 获取每个包的名字

// 4. 创建一个表
const outputOptions = {
  // 根据不同的环境，打包不同的文件
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife'
  }
}

const options = pkg.buildOptions // 获取每个包的配置

// rollup 需要导出一个配置
function createConfig(format, output) {
  // 进行打包的配置
  output.name = options.name // 导出的包的名字
  output.sourcemap = true // 是否生成sourcemap
  // output.globals = {
  //   vue: 'Vue'
  // } // 全局变量
  // const isProductionBuild = process.env.__DEV__ === 'false' // 是否是生产环境
  // if (isProductionBuild) {
  //   output.sourcemap = false // 生产环境不生成sourcemap
  // }
  return {
    input: resolve(`src/index.ts`), // 打包的入口
    output, // 打包的出口
    plugins: [
      // 1. 解析ts
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json') // tsconfig.json的路径
        // tsconfig.json的配置
        // tsconfigOverride: {
        //   // 编译选项
        //   compilerOptions: {
        //     declaration: true, // 生成声明文件
        //     declarationMap: true // 生成映射文件
        //   }
        // }
      }),
      // 2. 解析json
      json(),
      // 3. 解析第三方插件
      resolvePlugin({
        browser: true // 优先解析浏览器的版本
      })
    ]
  }
}
export default options.formats.map((format) => createConfig(format, outputOptions[format])) // 导出配置
