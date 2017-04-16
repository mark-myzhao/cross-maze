export default {
  compare (target, sourceArr) {
    for (let i in sourceArr) {
      if (sourceArr[i] === target) {
        return true
      }
    }
    return false
  }
}
