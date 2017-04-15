let express = require('express')
let axios = require('axios')
let router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('main', { title: "cross-maze" })
})

router.get('/test', (req, res, next) => {
  res.sendFile('test/index.html')
})

router.get('/test1', (req, res, next) => {
  res.sendFile('test1/record.html')
})

router.post('/api/speech', (req, res, next) => {

  // var data = {
  //   'format': 'wav',
  //   'rate': sampleRate,
  //   'channel': 1,
  //   'token': '24.6776a06d8bc535101fdbf75d06c49ab2.2592000.1494825798.282335-9523850',
  //   'cuid': '4a:00:01:e3:5c:81:2333',
  //   'len': len,
  //   'lan': 'zh',
  //   'speech': blob
  // }

  var instance = axios.create({
    baseURL: 'http://vop.baidu.com',
    timeout: 2000,
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
      res.status = 400
    })
})

router.get('/token', (req, res, next) => {
  const grantType = 'client_credentials'
  const apiKey = 'UIEotfbBYbzNAqUOSw13SuLe'
  const secretKey = '5e21be0c2d358cb4377165ecf07f6d9f'
  let url = 'https://openapi.baidu.com/oauth/2.0/token?'
  url += `grant_type=${grantType}`
  url += `&client_id=${apiKey}`
  url += `&client_secret=${secretKey}`
  console.log(url)
  axios.get(url)
  .then((result) => {
    console.log(result)
    res.json({ res: result.data.access_token })
  })
  .catch((err) => {
    res.json({ err })
  })
})

module.exports = router
