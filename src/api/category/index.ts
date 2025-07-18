import request from '@/utils/request'

/**
 * 分类分页查询
 */
export function getCategoryListApi(params: any) {
  return request({
    url: '/category/page',
    method: 'get',
    params
  })
}

/**
 * 新增分类
 */
export function addCategoryApi(data: any) {
  return request({
    url: '/category/add',
    method: 'post',
    data
  })
}

/**
 * 修改分类
 */
export function updateCategoryApi(data: any) {
  return request({
    url: '/category/update',
    method: 'put',
    data
  })
}

/**
 * 删除分类
 */
export function deleteCategoryApi(ids: string) {
  return request({
    url: '/category/delete',
    method: 'delete',
    params: { ids }
  })
}

/**
 * 查询所有分类
 */
export function getAllCategoriesApi() {
  return request({
    url: '/category/list',
    method: 'get'
  })
}