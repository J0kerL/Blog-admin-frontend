import request from '@/utils/request'

/**
 * 分页查询评论
 */
export function getCommentListApi(params: any) {
  return request({
    url: '/comment/admin/page',
    method: 'get',
    params
  })
}

/**
 * 批量删除评论
 */
export function deleteCommentApi(ids: number[]) {
  return request({
    url: '/comment/batch',
    method: 'delete',
    data: ids
  })
}