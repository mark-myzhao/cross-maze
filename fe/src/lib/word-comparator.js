export default {
  compare (target, sourceArr) {
    for (let str of sourceArr) {
      if (str.indexOf(target) !== -1) {
        return true
      }
    }
    return false
  }
}
