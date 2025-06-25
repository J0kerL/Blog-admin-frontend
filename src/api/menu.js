import request from '../utils/request'

// 分页查询菜单
export function getMenuPage(params) {
  return request({
    url: '/admin/menu/page',
    method: 'get',
    params
  })
}

// 获取所有菜单
export function getMenuList() {
  return request({
    url: '/admin/menu/list',
    method: 'get'
  })
}

// 根据ID查询菜单
export function getMenuById(id) {
  return request({
    url: `/admin/menu/${id}`,
    method: 'get'
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/admin/menu',
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(data) {
  return request({
    url: '/admin/menu',
    method: 'put',
    data
  })
}

// 删除菜单
export function deleteMenu(id) {
  return request({
    url: `/admin/menu/${id}`,
    method: 'delete'
  })
}

// 批量删除菜单
export function deleteMenus(ids) {
  return request({
    url: '/admin/menu/batch',
    method: 'delete',
    data: ids
  })
}