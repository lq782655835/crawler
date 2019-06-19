const puppeteer = require('puppeteer')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const log = console.log
const srcToImg = require('./utils/srcToImg')

const url = 'https://www.zhihu.com/question/22918070'
let result = []

const main = async function(headless){
    const browers = await puppeteer.launch({ headless, devtools: !headless })
    const page = await browers.newPage()

    await page.goto(url)
    log(chalk.yellow('页面初次加载完毕'))
    await page.waitFor('.List-item')

    // 知乎图片懒加载，故通过正则拿到图片地址
    let body = await page.$eval('body', el => el.innerHTML)
    body.replace(/<img src="(.*?)"\s/g, (s0, s1) => {
        console.log(s0, s1)
        result.push(s1)
        return s1
    })

    // 下载
    let targetFolder = path.resolve(__dirname, './mn')
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder)
    fs.writeFile(path.resolve(targetFolder, 'body.html'), body, 'utf-8', (err) => console.log(err))
    result.forEach(async src => await srcToImg(src, targetFolder))
    
    log(chalk.yellow('执行结果：'))
    log(chalk.green(JSON.stringify(result.length)))
    browers.close()
}


main(false)