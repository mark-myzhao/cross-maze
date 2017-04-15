function __log(e, data) {
  log.innerHTML += "\n" + e + " " + (data || '')
}
var audio_context
var recorder

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream)

  recorder = new Recorder(input)

      // 资源交换文件标识符
      writeString('RIFF'); offset += 4;
      // 下个地址开始到文件尾总字节数,即文件大小-8
      data.setUint32(offset, 36 + dataLength, true); offset += 4;
      // WAV文件标志
      writeString('WAVE'); offset += 4;
      // 波形格式标志
      writeString('fmt '); offset += 4;
      // 过滤字节,一般为 0x10 = 16
      data.setUint32(offset, 16, true); offset += 4;
      // 格式类别 (PCM形式采样数据)
      data.setUint16(offset, 1, true); offset += 2;
      // 通道数
      data.setUint16(offset, channelCount, true); offset += 2;
      // 采样率,每秒样本数,表示每个通道的播放速度
      data.setUint32(offset, sampleRate, true); offset += 4;
      // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
      data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4;
      // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
      data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
      // 每样本数据位数
      data.setUint16(offset, sampleBits, true); offset += 2;
      // 数据标识符
      writeString('data'); offset += 4;
      // 采样数据总数,即数据总大小-44
      data.setUint32(offset, dataLength, true); offset += 4;
      // 写入采样数据
      if (sampleBits === 8) {
        for (var i = 0; i < bytes.length; i++, offset++) {
          var s = Math.max(-1, Math.min(1, bytes[i]));
          var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
          val = parseInt(255 / (65535 / (val + 32768)));
          data.setInt8(offset, val, true);
        }
      } else {
        for (var i = 0; i < bytes.length; i++, offset += 2) {
          var s = Math.max(-1, Math.min(1, bytes[i]));
          data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
      }
      return new Blob([data], { type: 'audio/wav' });
    }
  }

  __log('Recorder initialised.')
}

function startRecording(button) {
  recorder && recorder.record()
  button.disabled = true
  button.nextElementSibling.disabled = false
  __log('Recording...')
}

function stopRecording(button) {
  recorder && recorder.stop()
  button.disabled = true
  button.previousElementSibling.disabled = false

  __log('Stopped recording.')

  testData = recorder.exportWAV(function(blob) {
    // send wav to server

    var reader = new window.FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      var base64data = reader.result;
      var data = {
        'format': 'wav',
        'rate': 8000,
        'channel': 1,
        'token': '24.6776a06d8bc535101fdbf75d06c49ab2.2592000.1494825798.282335-9523850',
        'cuid': '4a:00:01:e3:5c:81',
        'len': blob.size,
        'speech': base64data,
      }
      axios.post('http://vop.baidu.com/server_api', data)
        .then((result) => {
          console.log(result)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  })

  recorder.clear()
}

window.onload = function init() {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
    window.URL = window.URL || window.webkitURL

    audio_context = new AudioContext
    __log('Audio context set up.')
  } catch (e) {
    alert('No web audio support in this browser!')
  }

  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    __log('No live audio input: ' + e)
  })
}
