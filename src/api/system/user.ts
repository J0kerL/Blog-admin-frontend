import request from '@/utils/request'

/**
 * 获取用户列表（分页查询）
 */
export function getUserListApi(params?: any) {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}

// 兼容旧的函数名
export const getUserList = getUserListApi

/**
 * 新增用户
 */
export function createUserApi(data: any) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

// 兼容旧的函数名
export const addUser = createUserApi

/**
 * 修改用户
 */
export function updateUserApi(data: any) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

// 兼容旧的函数名
export const updateUser = updateUserApi

/**
 * 删除用户
 */
export function deleteUserApi(ids: string) {
  return request({
    url: '/user/delete',
    method: 'delete',
    params: { ids }
  })
}

// 兼容旧的函数名
export const deleteUser = deleteUserApi

/**
 * 重置用户密码
 */
export function resetUserPwdApi(data: any) {
  return request({
    url: '/user/resetPwd',
    method: 'put',
    data
  })
}

// 兼容旧的函数名
export const resetUserPwd = resetUserPwdApi

/**
 * 获取角色选项（临时实现，返回固定选项）
 */
export function getRoleOptionsApi() {
  return Promise.resolve({
    data: [
      { id: 1, name: '超级管理员' },
      { id: 2, name: '管理员' },
      { id: 3, name: '普通用户' }
    ]
  })
}

// 兼容旧的函数名
export const getRoleOptions = getRoleOptionsApi


// 获取用户个人信息
export function getUserProfileApi() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateUserProfileApi(data: any) {
  return request({
    url: '/user/update',
    method: 'put',
    data: data
  })
}

// 用户密码重置
export function updateUserPwdApi(oldPassword: string, newPassword: string) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/user/updatePwd',
    method: 'put',
    data
  })
}

// 用户头像上传
export function uploadAvatar(data: FormData) {
  return request({
    url: '/file/upload',
    method: 'post',
    headers: { "Content-Type": "multipart/form-data" },
    data: data,
    params: {
      type: 'avatar'
    }
  })
}

export function verifyPassword(password: string) {
  return request({
    url: `/user/verifyPassword/${password}`,
    method: 'get'
  })
}

// 获取在线用户
export function getOnlineUserApi(params: any) {
  return request<any>({
    url: '/monitor/online/list',
    method: 'get',
    params
  })
}

// 强制下线
export function forceLogoutApi(token: string) {
  return request<any>({
    url: `/monitor/online/forceLogout/${token}`,
    method: 'get'
  })
}

// 修改用户密码
export function changePasswordApi(data: any) {
  return request({
    url: '/user/change-password',
    method: 'put',
    data: data
  })
}

// 根据账号（用户名或邮箱）获取用户信息
export function getUserByAccountApi(account: string) {
  return request({
    url: `/user/${account}`,
    method: 'get'
  })
}

// 忘记密码 - 重置用户密码
export function resetPasswordByAccountApi(account: string, newPassword: string) {
  return request({
    url: '/user/resetPassword',
    method: 'put',
    data: {
      account,
      newPassword
    }
  })
}

// 忘记密码 - 专门的忘记密码接口
export function forgetPasswordApi(data: any) {
  return request({
    url: '/user/forgetPassword',
    method: 'put',
    data: data
  })
}


