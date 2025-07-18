import request from '@/utils/request'

/**
 * 获取角色列表（分页查询）
 */
export function getRoleListApi(params?: any) {
  return request({
    url: '/role/page',
    method: 'get',
    params
  })
}

/**
 * 添加角色
 */
export function createRoleApi(data: any) {
  return request({
    url: '/role/add',
    method: 'post',
    data
  })
}

/**
 * 修改角色
 */
export function updateRoleApi(data: any) {
  return request({
    url: '/role/update',
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export function deleteRoleApi(ids: string) {
  return request({
    url: '/role/delete',
    method: 'delete',
    params: { ids }
  })
}

/**
 * 获取所有角色列表
 */
export function getAllRoleListApi() {
  return request({
    url: '/role/list',
    method: 'get'
  })
}

// 临时兼容函数，如果后端没有对应API，返回空数据
export function getRoleMenusApi(roleId: number) {
  return Promise.resolve({ data: [] })
}

export function updateRoleMenusApi(roleId: any, menuIds: any) {
  return Promise.resolve({ data: 'success' })
}

