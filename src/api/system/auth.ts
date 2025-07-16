import request from '@/utils/request'

interface LoginParams {
  username: string
  password: string
  captchaCode?: string
  captchaKey?: string
}

// 登录接口
export function loginApi(data: LoginParams) {
  // 将前端参数映射为后端需要的格式
  const params = {
    account: data.username,
    password: data.password
  };
  
  return request({
    url: '/user/login',
    method: 'post',
    data: params
  })
}

export function logoutApi() {
    return request({
      url: '/user/logout',
      method: 'post',
    })
  }

// 获取用户信息
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