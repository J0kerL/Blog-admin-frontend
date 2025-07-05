import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardDataApi() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

// 获取最近七天访问统计 - 根据后端实际API调整
export function getVisitStatsApi() {
  return request({
    url: '/dashboard/visits',
    method: 'get'
  })
}

// 获取分类统计 - 根据后端实际API调整
export function getCategoryStatsApi() {
  return request({
    url: '/dashboard/categories',
    method: 'get'
  })
}
