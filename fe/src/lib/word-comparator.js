export default {
  compare (targetArr, sourceArr) {
    // 0, 1, 2, 3 上下左右
    for (let i in targetArr) {
      for (let str of sourceArr) {
        if (str.indexOf(targetArr[i]) !== -1) {
          return i
        }
      }
    }
    return -1
  }
}
