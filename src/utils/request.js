import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080/api', // 根据实际后端地址配置
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token - 使用Authorization作为token名称与后端保持一致
    const token = localStorage.getItem('Authorization')
    // 如果token存在，则添加到请求头中
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 如果返回的状态码不是200，则判断为错误
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      
      // 如果是401，则表示token无效或过期，需要重新登录
      if (res.code === 401) {
        // 清除本地存储的token和用户信息
        localStorage.removeItem('Authorization')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        localStorage.removeItem('email')
        
        // 跳转到登录页
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.msg || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    console.error('响应拦截器错误:', error)
    ElMessage.error('网络错误，请稍后重试')
    return Promise.reject(error)
  }
)

export default service