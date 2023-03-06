// 进行打包 monorepo
// 1. 读取 packages 目录下的所有包
const fs = require('fs')

// 注意：这里的 dirs 是一个数组，里面的每一项都是一个字符串，就是文件夹的名字
// const dirs = fs.readdirSync('packages') // 拿到文件的目录

// 注意：只有文件夹才会进行打包，所以要过滤掉文件
// dirs.filter((dir) => fs.statSync(`packages/${dir}`).isDirectory())

// 所以，综上所述，优化代码为：
const dirs = fs.readdirSync('packages').filter((dir) => fs.statSync(`packages/${dir}`).isDirectory())

// 2. 遍历每一个包，进行打包

console.log(`output->dirs`, dirs)
