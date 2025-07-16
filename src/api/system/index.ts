import request from '@/utils/request'

/**
 * 获取dashboard数据
 */
export function getDashboardDataApi() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

// 获取文章统计数据
export function getBottomDataApi() {
  return request({
    url: '/dashboard/categories',
    method: 'get'
  })
}
