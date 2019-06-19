const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

module.exports = async(src, dir) => {
  if(/\.(jpg|png|gif)$/.test(src)) {
    await urlToImg(src, dir);
  }else {
    await base64ToImg(src, dir); 
  }
}

// 识别src为http或者https的图片
const urlToImg = promisify((url, dir, callback) => {
  const mod = /^https:/.test(url) ? https : http;
  const ext = path.extname(url);
  const filename = path.basename(url)
  const file = path.join(dir, `${Date.now()}${filename}${ext}`);
  mod.get(url, res => {
    res.pipe(fs.createWriteStream(file))
      .on('finish', () => {
        callback();
        console.log(file);
      })
  })
})

// 识别src为base64地址的图片
const base64ToImg = async (base64Str, dir) => {
  // data: image/jpeg;base64,/raegreagearg
  const matchs = base64Str.match(/^data:(.+?);base64,(.+)$/);
  try {
    const ext = matches[1].split('/')[1]
      .replace('jpeg', 'jpg');
    const file = path.join(dir, `${Date.now()}.${ext}`);
    await writeFile(file, match[2], 'base64');
    console.log(file);
  } catch (ex) {
    console.log('非法 base64 字符串');
  }
}