// 进行打包 monorepo
// 1. 读取 packages 目录下的所有包
import fs from 'fs'
import { execa } from 'execa'

// 注意：这里的 dirs 是一个数组，里面的每一项都是一个字符串，就是文件夹的名字
// const dirs = fs.readdirSync('packages') // 拿到文件的目录

// 注意：只有文件夹才会进行打包，所以要过滤掉文件
// dirs.filter((dir) => fs.statSync(`packages/${dir}`).isDirectory())

// 所以，综上所述，优化代码为：
const dirs = fs.readdirSync('packages').filter((dir) => fs.statSync(`packages/${dir}`).isDirectory())

// 2. 遍历每一个包，进行打包（并行）
async function build(dir) {
  console.log(`output->${dir}`, 222)
  // 这里的 dir 就是每一个包的名字
  // 2.1 执行 rollup 打包
  // 注意：execa 是一个异步方法，所以要加 await
  // 注意：execa 的第二个参数是一个数组，里面的每一项都是一个字符串，就是命令的参数
  // -c 执行rollup.config.js文件 （执行rollup配置）; --environment 环境变量
  // 注意：execa 的第三个参数是一个对象，里面的 stdio 属性是一个字符串，表示标准输入输出的方式
  await execa('rollup', ['-cw', '--environment', `TARGET:${dir}`], {
    stdio: 'inherit' // 继承父进程的输入输出（子进程的输出在父包中输出）
  })
}

async function runParallel(dir, itemFn) {
  // 遍历每一个包
  let result = []
  dir.map((item) => {
    // 这里的 item 就是每一个包的名字
    result.push(itemFn(item))
  })
  return Promise.all(result) // 存放的是每一个包的打包结果，等待所有的包都打包完成后，再调用成功的回调
}

runParallel(dirs, build).then(() => {
  // .then() 是 Promise 的方法
  console.log(`output->成功`)
})
