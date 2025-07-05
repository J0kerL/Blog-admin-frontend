import request from '@/utils/request'

// 获取分类信息（分页）
export function getCategoryListApi(params: any) {
  return request({
    url: '/category/page',
    method: 'get',
    params
  })
}

// 获取所有分类
export function getAllCategoryApi() {
  return request({
    url: '/category/list',
    method: 'get'
  })
}

// 新增分类
export function addCategoryApi(data: any) {
  return request({
    url: '/category/add',
    method: 'post',
    data
  })
}

// 修改分类
export function updateCategoryApi(data: any) {
  return request({
    url: '/category/update',
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategoryApi(ids: any) {
  return request({
    url: `/category/delete`,
    method: 'delete',
    params: { ids }
  })
}