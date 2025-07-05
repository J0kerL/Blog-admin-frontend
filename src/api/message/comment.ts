import request from '@/utils/request'

// 获取评论列表（分页）
export function getCommentListApi(params: any) {
  return request({
    url: '/admin/comment/page',
    method: 'get',
    params
  })
}

// 批量删除评论
export function deleteCommentApi(ids: number[]) {
  return request({
    url: `/admin/comment/batch`,
    method: 'delete',
    data: ids
  })
}