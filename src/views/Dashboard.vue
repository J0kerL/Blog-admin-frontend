<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">欢迎回来，这里是您的数据概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in statsData" :key="stat.title">
           <div class="stat-header">
             <div class="stat-icon" :class="stat.iconClass">
               <el-icon>
                 <component :is="stat.icon" />
               </el-icon>
             </div>
           </div>
           <div class="stat-content">
             <div class="stat-value">{{ stat.value }}</div>
             <div class="stat-title">{{ stat.title }}</div>
           </div>
         </div>
      </div>
    </div>
    

    
    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="charts-grid">
        <!-- 访问趋势 -->
        <div class="chart-container large">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">访问趋势</h3>
            </div>
            <div class="chart-body">
              <v-chart class="chart" :option="lineOption" />
            </div>
          </div>
        </div>
        
        <!-- 分类统计 -->
        <div class="chart-container small">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">分类分布</h3>
            </div>
            <div class="chart-body">
              <v-chart class="chart" :option="pieOption" />
              <div class="pie-legend">
                <div class="legend-item" v-for="item in pieData" :key="item.name">
                  <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                  <span class="legend-text">{{ item.name }}</span>
                  <span class="legend-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Document, User, View, ChatDotRound } from '@element-plus/icons-vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 统计数据（硬编码，可后续改为API获取）
const statsData = ref([
  {
    title: '文章数量',
    value: 108,
    icon: Document,
    iconClass: 'blue'
  },
  {
    title: '用户数',
    value: 574,
    icon: User,
    iconClass: 'green'
  },
  {
    title: '浏览量',
    value: 1008,
    icon: View,
    iconClass: 'orange'
  },
  {
    title: '评论数量',
    value: 42492,
    icon: ChatDotRound,
    iconClass: 'purple'
  }
])

// 获取实时统计数据的函数
const fetchStatsData = async () => {
  try {
    const response = await request.get('/dashboard/stats')
    const data = response.data
    
    // 更新统计数据
    statsData.value = [
      {
        title: '文章数量',
        value: data.articleCount || 0,
        icon: Document,
        iconClass: 'blue'
      },
      {
        title: '用户数量',
        value: data.userCount || 0,
        icon: User,
        iconClass: 'green'
      },
      {
        title: '浏览量',
        value: data.viewCount || 0,
        icon: View,
        iconClass: 'orange'
      },
      {
        title: '评论数量',
        value: data.commentCount || 0,
        icon: ChatDotRound,
        iconClass: 'purple'
      }
    ]
    
    console.log('获取统计数据成功')
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}



const pieData = ref([
  { name: '技术文章', value: 35, color: '#409EFF' },
  { name: '生活随笔', value: 25, color: '#67C23A' },
  { name: '学习笔记', value: 20, color: '#E6A23C' },
  { name: '项目总结', value: 15, color: '#F56C6C' },
  { name: '其他分类', value: 5, color: '#909399' }
])

// 获取分类统计数据
const fetchCategoryStats = async () => {
  try {
    const response = await request.get('/dashboard/categories')
    const data = response.data
    
    if (data.names && data.values && data.colors) {
      pieData.value = data.names.map((name, index) => ({
        name,
        value: data.values[index],
        color: data.colors[index]
      }))
      
      // 更新饼图配置
      pieOption.value.series[0].data = pieData.value.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color }
      }))
    }
  } catch (error) {
    console.error('获取分类统计失败:', error)
  }
}

// 获取访问统计数据
const fetchVisitStats = async () => {
  try {
    const response = await request.get('/dashboard/visits')
    const data = response.data
    
    if (data.dates && data.visits) {
      lineOption.value.xAxis.data = data.dates
      lineOption.value.series[0].data = data.visits
    }
  } catch (error) {
    console.error('获取访问统计失败:', error)
  }
}

const pieOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  series: [
    {
      name: '分类统计',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: pieData.value.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: false
      }
    }
  ]
})

const lineOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      stack: 'Total',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      },
      lineStyle: {
        color: '#409EFF'
      },
      data: [120, 132, 101, 134, 90, 230, 210]
    }
  ]
})



// 组件挂载时获取数据
onMounted(() => {
  fetchStatsData()
  fetchCategoryStats()
  fetchVisitStats()
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f8fafc;
  min-height: calc(100vh - 60px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 页面标题 */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

/* 统计卡片区域 */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.stat-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}



.stat-content {
  text-align: left;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 32px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.chart-container {
  min-height: 300px;
}

.chart-container.large {
  grid-column: 1;
}

.chart-container.small {
  grid-column: 2;
}

.chart-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}



.chart-body {
  flex: 1;
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
}

.chart {
  flex: 1;
  min-height: 200px;
}

/* 饼图图例 */
.pie-legend {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pie-legend .legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.pie-legend .legend-item:hover {
  background: #f1f5f9;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.legend-text {
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.legend-value {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}



/* 响应式设计 */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container.large,
  .chart-container.small {
    grid-column: 1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .chart-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>