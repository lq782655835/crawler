const puppeteer = require('puppeteer')
const chalk = require('chalk')
const log = console.log

const url = 'https://pinyin.sogou.com/dict/ywz/'
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
    await page.waitFor('#ywz_content_list')
    log(chalk.yellow('页面初次加载完毕'))


    async function handleData() {
        let pageResult = await page.$$eval('#ywz_content_list ul li', lis => {
            // 进入浏览器环境
            return Array.from(lis).map(li => {
                let icon = li.querySelector('.ywz_content').innerHTML
                let text = li.querySelector('.ywz_cont_name').innerHTML.replace('输入文字：', '')
                console.log(icon)
                return {icon, text}
            })
        })
        result = result.concat(pageResult)
        log(pageResult)
    }

    for (let i = 1; i <= 7; i++) {
        log(i)

        let nextJumpEl = await page.$(`#ywz_page li:nth-child(${i})`)
        // let innerHtml = await nextJumpEl.$eval('span', el => el.innerHTML)
        await nextJumpEl.click()
        await page.waitFor(5000)

        await handleData()
    }

    // 回到node环境
    log(chalk.yellow('执行结果：'))
    log(chalk.green(JSON.stringify(result)))
    browers.close()
}


main(true)