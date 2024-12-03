import useClipboard from 'vue-clipboard3'

/**
 * 复制功能
 * @param {String} str
 */
const { toClipboard } = useClipboard()
export const copyText = async str => {
  try {
    await toClipboard(str)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error(e)
  }
}

/**
 * 合并到目标对象，并且复制，筛掉多余键值对
 * @param {Object} targetObj
 * @param {Object} sourceObj
 */
export const getMergeParams = (targetObj, sourceObj) => {
  const result = {}
  Object.keys(targetObj).forEach(key1 => {
    Object.keys(sourceObj).forEach(key2 => {
      if (key1 === key2) {
        result[key1] = sourceObj[key2]
      }
    })
  })
  return result
}

/**
 * 下载文件
 * @param {String} url
 * @param {String} fileName
 * @param {Function} cb
 */
export const downloadFile = (url = '', fileName = '未知文件', cb) => {
  const a = document.createElement('a')
  a.style.display = 'none'
  a.setAttribute('target', '_blank')
  /*
   * download的属性是HTML5新增的属性
   * href属性的地址必须是非跨域的地址，如果引用的是第三方的网站或者说是前后端分离的项目(调用后台的接口)，这时download就会不起作用。
   * 此时，如果是下载浏览器无法解析的文件，例如.exe,.xlsx..那么浏览器会自动下载，但是如果使用浏览器可以解析的文件，比如.txt,.png,.pdf....浏览器就会采取预览模式
   * 所以，对于.txt,.png,.pdf等的预览功能我们就可以直接不设置download属性(前提是后端响应头的Content-Type: application/octet-stream，如果为application/pdf浏览器则会判断文件为 pdf ，自动执行预览的策略)
   */
  fileName && a.setAttribute('download', fileName)
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  cb && cb()
}

/**
 * 下载Blob文件
 * @param {String} data
 * @param {String} fileName
 * @param {String} type
 */
export const downloadBlob = (data, fileName = '未知文件.xlsx', type) => {
  const blob = new Blob([data], { type }) // 处理文档流
  const a = document.createElement('a') // 创建a标签
  a.download = fileName.replace(new RegExp('"', 'g'), '')
  a.style.display = 'none'
  a.href = URL.createObjectURL(blob) // 创建blob地址
  document.body.appendChild(a) // 将a标签添加到body中
  a.click()
  URL.revokeObjectURL(a.href) // 释放URL对象
  document.body.removeChild(a) // 从body中移除a标签
}

/**
 * Check if an element has a class
 * @param {HTMLElement} ele
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`))
}

/**
 * Add class to element
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ` ${cls}`
}

/**
 * Remove class from element
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp(`(\\s|^)${cls}(\\s|$)`)
    ele.className = ele.className.replace(reg, ' ')
  }
}

/**
 * 判断是否是外部链接
 *
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path)
  return isExternal
}

// 睡眠
export const sleep = time =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })

/**
 * API Key 隐藏为首2位****末4位
 * @param str 当前值字符串
 * @returns 首2位****末4位字符串
 */
export function maskAPIKEY(str) {
  // 使用正则表达式替换中间部分
  return str.replace(/^(..).*?(....)$/, '$1****$2')
}
