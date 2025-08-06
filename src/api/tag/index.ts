import request from '@/utils/request'

/**
 * 分页查询标签
 */
export function getTagListApi(params: any) {
  return request({
    url: '/tag/page',
    method: 'get',
    params
  })
}

/**
 * 新增标签
 */
export function addTagApi(data: any) {
  return request({
    url: '/tag/add',
    method: 'post',
    data
  })
}

/**
 * 修改标签
 */
export function updateTagApi(data: any) {
  return request({
    url: '/tag/update',
    method: 'put',
    data
  })
}

/**
 * 批量删除标签
 */
export function deleteTagApi(ids: string) {
  return request({
    url: '/tag/delete',
    method: 'delete',
    params: { ids }
  })
}

/**
 * 查询所有标签
 */
export function getAllTagsApi() {
  return request({
    url: '/tag/list',
    method: 'get'
  })
}