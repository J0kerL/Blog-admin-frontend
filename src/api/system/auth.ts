import request from '@/utils/request'

interface LoginParams {
  account: string
  password: string
}

// 登录接口
export function loginApi(data: LoginParams) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function logoutApi() {
    return request({
      url: '/user/logout',
      method: 'post',
    })
  }

// 获取用户信息 - 根据后端实际API调整
export function getUserInfoApi() {
  return request({
    url: "/user/info",
    method: "get"
  })
}

export function getRouters() {
  return request({
    url: '/admin/menu/getMenu',
    method: 'get'
  })
}