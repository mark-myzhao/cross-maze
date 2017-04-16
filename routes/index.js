let express = require('express')
let axios = require('axios')
let router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('main', { title: "cross-maze" })
})

/**
 * 用语音数据、参数、API token 获取语音识别结果
 *
 * @param {Object} req 请求
 * @param {Object} res 响应
 * @param {Object} next 下一个中间件
 * @param {Function} resolve Promise resolve
 * @param {Function} reject Promise reject
 */
router.post('/api/speech', (req, res, next) => {

  // 数据格式
  // var data = {
  //   'format': 'wav',
  //   'rate': sampleRate,
  //   'channel': 1,
  //   'token': '24.6776a06d8bc535101fdbf75d06c49ab2.2592000.1494825798.282335-9523850',
  //   'cuid': '4a:00:01:e3:5c:81:2333',
  //   'len': len,
  //   'lan': 'ct',
  //   'speech': blob
  // }

  // 将token保存服务端，保证安全性
  req.body.token = '24.6776a06d8bc535101fdbf75d06c49ab2.2592000.1494825798.282335-9523850'

  var instance = axios.create({
    baseURL: 'http://vop.baidu.com',
    timeout: 10000, // 10s
    headers: {
     'Content-Type': 'application/json'
    }
  })

  instance.post('/server_api', req.body)
    .then((result) => {
      res.json({res: result.data})
    })
    .catch((err) => {
      console.log(err)
      res.status = 404
    })
})

/**
 * 从百度服务器获取API token，有效期1个月
 *
 * @param {Object} req 请求
 * @param {Object} res 响应
 * @param {Object} next 下一个中间件
 * @param {Function} resolve Promise resolve
 * @param {Function} reject Promise reject
 */
router.get('/token', (req, res, next) => {
  const grantType = 'client_credentials'
  const apiKey = 'UIEotfbBYbzNAqUOSw13SuLe'
  const secretKey = '5e21be0c2d358cb4377165ecf07f6d9f'
  let url = 'https://openapi.baidu.com/oauth/2.0/token?'
  url += `grant_type=${grantType}`
  url += `&client_id=${apiKey}`
  url += `&client_secret=${secretKey}`

  axios.get(url)
  .then((result) => {
    res.json({ res: result.data.access_token })
  })
  .catch((err) => {
    res.json({ err })
  })
})

module.exports = router
