import request from '@/utils/request'

// 获取标签列表（分页）
export function getTagListApi(params: any) {
  return request({
    url: '/admin/tag/page',
    method: 'get',
    params
  })
}

// 获取所有标签
export function getAllTagApi() {
  return request({
    url: '/admin/tag/list',
    method: 'get'
  })
}

// 新增标签
export function addTagApi(data: any) {
  return request({
    url: '/admin/tag',
    method: 'post',
    data
  })
}

// 修改标签
export function updateTagApi(data: any) {
  return request({
    url: '/admin/tag',
    method: 'put',
    data
  })
}

// 删除标签
export function deleteTagApi(ids: any) {
  return request({
    url: `/admin/tag`,
    method: 'delete',
    params: { ids }
  })
}