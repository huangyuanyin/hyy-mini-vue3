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
const packageOptions = pkg.buildOptions // 获取每个包的配置

console.log(`packageOptions`, packageOptions)
