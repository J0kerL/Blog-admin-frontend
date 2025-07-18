import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStatsApi() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取分类统计数据
 */
export function getCategoryStatsApi() {
  return request({
    url: '/dashboard/categories',
    method: 'get'
  })
}