<template>
  <div class="hello">
    <h2>请打开控制台查看识别结果</h2>
    <div id="btn">Init...</div>
  </div>
</template>

<script>
import * as basr from '../service/record'

export default {
  name: 'hello',
  created () {
    function ready() {
      var ele = document.getElementById('btn');
      var voice;
      var TEXT_N = 'Push Me';
      var TEXT_S = 'Listening';
      var TEXT_X = 'Recognizing';
      var status = 0;
      ele.innerHTML = TEXT_N;
      ele.addEventListener(
          'mousedown',
          function (e) {
              if (status) {
                  return;
              }
              ele.innerHTML = TEXT_S;
              voice = basr.start();
              e.preventDefault();
          }
      );
      ele.addEventListener(
          'mouseup',
          function (e) {
              status = 1;
              ele.innerHTML = TEXT_X;
              voice
                  .end()
                  .result()
                  .then(
                      function (res) {
                          console.log('Result: ' + res);
                      },
                      function (error) {
                          console.error('Error: ' + JSON.stringify(error));
                      }
                  )
                  .then(
                      function () {
                          status = 0;
                          ele.innerHTML = TEXT_N;
                      }
                  );
              e.preventDefault();
          }
      );
    }

    function error() {
        alert('如要使用语音识别，请授权语音操作');
    }

    basr
        .authorize(
            {
                token: '24.6776a06d8bc535101fdbf75d06c49ab2.2592000.1494825798.282335-9523850',
                url: '/api/speech'
            }
        )
        .then(ready, error);
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#btn {
    width: 100px;
    height: 100px;
    background: #000;
    position: fixed;
    bottom: 40px;
    left: 50%;
    margin-left: -50px;
    border-radius: 999px;
    color: #FFF;
    text-align: center;
    line-height: 100px;
    cursor: pointer;
}
</style>
