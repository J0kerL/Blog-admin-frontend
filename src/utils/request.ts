import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  withCredentials: true, // 允许跨域携带cookie
})

// 防重复登录弹框标志
const isRelogin = { show: false }

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    
    // 确保token存在且不为空字符串
    if (token && token.trim() !== '') {
      config.headers['Authorization'] = token.trim()
    } else {
      // 如果没有token，删除Authorization头，避免发送空token
      delete config.headers['Authorization']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 检查响应是否成功：code为200表示成功，其他值（包括null/undefined）表示失败
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求错误')
      if (res.code === 401) {
        // 检查当前是否在登录页面，如果在登录页面则不显示弹框
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && !isRelogin.show) {
          isRelogin.show = true
          ElMessageBox.confirm("当前页面已失效，请重新登录", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(() => {
            const userStore = useUserStore()
            userStore.logout()
          })
          .finally(() => {
            isRelogin.show = false
          })
        }
      }
      return Promise.reject(new Error(res.msg || '请求错误'))
    }
    
    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && !isRelogin.show) {
        isRelogin.show = true
        ElMessageBox.confirm("当前页面已失效，请重新登录", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          const userStore = useUserStore()
          userStore.logout()
        })
        .finally(() => {
          isRelogin.show = false
        })
      }
      return Promise.reject(new Error('用户未登录'))
    }else if (error.response?.status === 500) {
      ElMessage.error('后端接口连接异常')
    }else{
      ElMessage.error('请求错误')
    }
    return Promise.reject(error)
  }
)

export default service