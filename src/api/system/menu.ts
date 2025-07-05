import request from '@/utils/request'

/**
 * 获取菜单列表（分页）
 */
export function getMenuListApi(params?: any) {
  return request({
    url: '/admin/menu/page',
    method: 'get',
    params
  })
}

/**
 * 获取所有菜单
 */
export function getAllMenuApi() {
  return request({
    url: '/admin/menu/list',
    method: 'get'
  })
}

/**
 * 获取菜单详情
 */
export function getMenuDetailApi(id: string) {
  return request({
    url: `/admin/menu/${id}`,
    method: 'get'
  })
}

/**
 * 新增菜单
 */
export function createMenuApi(data: any) {
  return request({
    url: '/admin/menu',
    method: 'post',
    data
  })
}

/**
 * 修改菜单
 */
export function updateMenuApi(data: any) {
  return request({
    url: `/admin/menu`,
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export function deleteMenuApi(id: string) {
  return request({
    url: `/admin/menu/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除菜单
 */
export function batchDeleteMenuApi(ids: number[]) {
  return request({
    url: `/admin/menu/batch`,
    method: 'delete',
    data: ids
  })
}

export function listRoutes() {
  return request({
    url: '/admin/menu/getMenu',
    method: 'get',
  })
}