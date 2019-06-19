const puppeteer = require('puppeteer')
const chalk = require('chalk')
const log = console.log

const url = 'https://pinyin.sogou.com/dict/ywz/'
const contentContainerSelector = '#ywz_content_list'
const paginationContainerSelector = '#ywz_page'
let result = []

const main = async function(headless){
    const browers = await puppeteer.launch({ headless, devtools: !headless })
    const page = await browers.newPage()

    // 拦截图片无用请求
    await page.setRequestInterception(true)
    await page.on('request',interceptedRequest => {
        if(interceptedRequest.url().endsWith('.jpg') || interceptedRequest.url().endsWith('.png')){
            interceptedRequest.abort();
        }else{
            interceptedRequest.continue();
        }
    })

    // 监听页面内部的console消息
    false && page.on('console', msg => {
        if (typeof msg === 'object') {
            console.dir(msg)
        } else {
            log(chalk.blue(msg))
        }
    })

    await page.goto(url)
    await page.waitFor(contentContainerSelector)
    log(chalk.yellow('页面初次加载完毕'))


    async function handleData() {
        let pageResult = await page.$$eval(`${contentContainerSelector} ul li`, lis => {
            // 进入浏览器环境
            return Array.from(lis).map(li => {
                let icon = li.querySelector('.ywz_content').textContent
                let text = li.querySelector('.ywz_cont_name').textContent.replace('输入文字：', '')
                console.log(icon)
                return {icon, text}
            })
        })
        result = result.concat(pageResult)
        log(pageResult)
    }

    let pageTotal = await page.$eval(`${paginationContainerSelector} li:nth-last-child(2)`, ele => ele.textContent)
    for (let i = 1; i <= pageTotal; i++) {
        log(i)

        let nextJumpEl = await page.$(`${paginationContainerSelector} li:nth-child(${i > 1 ? i+1 : i})`)
        await nextJumpEl.click()
        await page.waitFor(contentContainerSelector)

        await handleData()
    }

    // 回到node环境
    log(chalk.yellow('执行结果：'))
    log(chalk.green(JSON.stringify(result)))
    browers.close()
}


main(true)