import request from '@/utils/request'

/**
 * 获取菜单列表
 */
export function getMenuListApi() {
  return request({
    url: '/admin/menu/getMenu',
    method: 'get'
  })
}

/**
 * 分页查询菜单
 */
export function pageQueryMenuApi(params: any) {
  return request({
    url: '/admin/menu/page',
    method: 'get',
    params
  })
}

/**
 * 获取菜单详情
 */
export function getMenuDetailApi(id: number) {
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
    url: '/admin/menu',
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export function deleteMenuApi(id: number) {
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
    url: '/admin/menu/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 获取所有菜单
 */
export function getAllMenusApi() {
  return request({
    url: '/admin/menu/list',
    method: 'get',
  })
}