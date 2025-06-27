import request from '../utils/request'

// 分页查询评论
export function getCommentPage(params) {
  return request({
    url: '/admin/comment/page',
    method: 'get',
    params
  })
}

// 批量删除评论
export function batchDeleteComment(ids) {
  return request({
    url: '/admin/comment/batch',
    method: 'delete',
    data: ids
  })
}