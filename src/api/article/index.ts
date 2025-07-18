import request from '@/utils/request'

// 获取文章列表（分页查询）
export function getArticleListApi(params: any) {
  return request({
    url: '/article/page',
    method: 'get',
    params
  })
}

// 获取文章详情
export function getDetailApi(id: any) {
  return request({
    url: `/article/get/${id}`,
    method: 'get',
  })
}

// 新增文章
export function addArticleApi(data: any) {
  return request({
    url: '/article/add',
    method: 'post',
    data
  })
}

// 修改文章
export function updateArticleApi(data: any) {
  return request({
    url: '/article/update',
    method: 'put',
    data
  })
}

// 删除文章
export function deleteArticleApi(ids: any) {
  return request({
    url: `/article/delete`,
    method: 'delete',
    params: { ids }
  })
}