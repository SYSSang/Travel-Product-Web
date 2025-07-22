import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3005',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { customAuth?: boolean }) => {
    const token = localStorage.getItem('token')

    // 只有明确标记了customAuth才添加token
    if (token && config.customAuth) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (err: AxiosError) => {
    return Promise.reject(err)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const { status, data, message } = res.data
    if (status === 1) {
      return data
    }
    return Promise.reject({ status, message, data })
  },
  (err: AxiosError) => {
    return Promise.reject(err)
  }
)

// // 错误消息转中文
// function onErrorReason(message: string): string {
//   if (message.includes('Network Error')) return '网络异常，请检查网络情况!'
//   if (message.includes('timeout')) return '请求超时，请重试!'
//   return '服务异常，请重试!'
// }

export default axiosInstance
