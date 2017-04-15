let express = require('express')
let axios = require('axios')
let router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('main', { title: "cross-maze" })
})

// App ID: 9523850
// API Key:
// Secret Key:

router.post('/speech', (req, res, next) => {
  // res.set('Content-Type', 'application/json')
  var data = {
    'format': 'speex',
    'rate': 8000,
    'channel': 1,
    'token': '24.6776a06d8bc535101fdbf75d06c49ab2.2592000.1494825798.282335-9523850',
    'cuid': '4a:00:01:e3:5c:81',
    'len': 4096,
    'speech': 'xxx',
  }
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
