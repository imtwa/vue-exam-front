import axios from 'axios'
import { useUserStoreHook } from '@/store/modules/user'
import { ResultEnum } from '@/enums/ResultEnum'
import { TOKEN_KEY, BASE_URL } from '@/constants'
import { downloadBlob } from '@/utils/index'

const whiteUrlList = ['/api/maas/auths/captcha']

// 请求map
const pendingMap = new Map()

// 创建 axios 实例
const service = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    removePending(config)
    addPending(config)
    const accessToken = localStorage.getItem(TOKEN_KEY)
    if (accessToken) {
      config.headers.Authorization = accessToken
      config.headers['X-Request-Identity'] = new Date().getTime()
    }
    if (!whiteUrlList.includes(config.url)) {
      const userStore = useUserStoreHook()
      // 加入通用请求参数
      if (config.method === 'post' || config.method === 'put') {
        const baseParams = {
          // tent_id: userStore.tent_id,
          spac_id: userStore.current_space?.spac_id || 1401
        }
        config.data = Object.assign(baseParams, config.data)
      } else {
        config.url = `${config.url}${config.url.indexOf('?') !== -1 ? '&' : '?'}spac_id=${userStore.current_space?.spac_id}`
      }
    }
    return config
  },
  error => Promise.reject(error)
)

let errorMsgBoxLock = false

// 响应拦截器
service.interceptors.response.use(
  response => {
    removePending(response.config)
    // 检查配置的响应类型是否为二进制类型（'blob' 或 'arraybuffer'）, 如果是，直接返回响应对象
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }

    const { code, data, msg } = response.data
    if (code === ResultEnum.SUCCESS) {
      return data
    }

    ElMessage.error(msg || '系统出错')
    return Promise.reject(new Error(msg || 'Error'))
  },
  error => {
    error.config && removePending(error.config)
    const { status, data, statusText } = error.response || {}
    const errorMsg = statusText || error.message
    // 通过解析data来判断提示
    if (data) {
      const { code, msg } = data
      if (code === ResultEnum.TOKEN_INVALID) {
        if (!errorMsgBoxLock) {
          errorMsgBoxLock = true
          ElMessageBox.confirm('当前页面已失效，请重新登录', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const userStore = useUserStoreHook()
              userStore.resetToken().then(() => {
                errorMsgBoxLock = false
                window.location.reload()
              })
            })
            .catch(() => {
              errorMsgBoxLock = false
            })
        }
      } else {
        ElMessage.error(msg || '系统出错')
      }
    } else if (status === 500 && !data) {
      // 异常处理，解析最外层的数据判断提示
      ElMessage.error(statusText || '系统出错')
    }
    return Promise.reject(errorMsg)
  }
)

/**
 * 储存每个请求的唯一cancel回调, 以此为标识
 * @param {*} config
 */
function addPending(config) {
  const pendingKey = getPendingKey(config)
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken(cancel => {
      if (!pendingMap.has(pendingKey)) {
        pendingMap.set(pendingKey, cancel)
      }
    })
}

/**
 * 删除重复的请求
 * @param {*} config
 */
function removePending(config) {
  const pendingKey = getPendingKey(config)
  if (pendingMap.has(pendingKey)) {
    const cancelToken = pendingMap.get(pendingKey)
    cancelToken(pendingKey)
    pendingMap.delete(pendingKey)
  }
}

/**
 * 生成唯一的每个请求的唯一key
 * @param {*} config
 * @returns
 */
function getPendingKey(config) {
  let { url, method, params, data } = config
  if (typeof data === 'string') data = JSON.parse(data) // response里面返回的config.data是个字符串对象
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 导出 axios 实例
export default service

export function downloadStream(axiosConfig = {}, options = {}) {
  // eslint-disable-next-line prefer-object-spread
  const config = Object.assign({ withCredentials: true, timeout: 10000 }, options)
  const service = axios.create({
    baseURL: BASE_URL, // 设置统一的请求前缀
    timeout: config.timeout, // 设置统一的超时时长10s
    withCredentials: config.withCredentials,
    responseType: 'blob',
    headers: {
      Authorization: localStorage.getItem(TOKEN_KEY)
    }
  })

  const userStore = useUserStoreHook()
  // 加入通用请求参数
  if (axiosConfig.method === 'post' || axiosConfig.method === 'put') {
    const baseParams = {
      // tent_id: userStore.tent_id,
      spac_id: userStore.current_space?.spac_id || 1401
    }
    axiosConfig.data = Object.assign(baseParams, axiosConfig.data)
  } else {
    axiosConfig.url = `${axiosConfig.url}${axiosConfig.url.indexOf('?') !== -1 ? '&' : '?'}spac_id=${userStore.current_space?.spac_id}`
  }
  return new Promise((resolve, reject) => {
    service(axiosConfig)
      .then(res => {
        if (res.data) {
          let filename = ''
          const contentDisposition = res.headers['content-disposition']

          if (contentDisposition) {
            filename = decodeURIComponent(
              contentDisposition.split('fileName=')[1] || contentDisposition.split('filename=')[1]
            )
          }

          // const temp = res?.headers?.['content-disposition']?.split(';')?.[1]?.split('filename=')?.[1]
          // const filename = decodeURIComponent(temp)
          downloadBlob(res.data, config.filename || filename, res.headers['content-type'])
          resolve(res)
        } else {
          reject(res)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}
