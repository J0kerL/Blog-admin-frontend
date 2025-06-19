<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">文章数量</div>
                <div class="stat-value">108</div>
              </div>
              <div class="stat-icon blue">
                <el-icon><Document /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">用户数</div>
                <div class="stat-value">574</div>
              </div>
              <div class="stat-icon green">
                <el-icon><User /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">浏览量</div>
                <div class="stat-value">1008</div>
              </div>
              <div class="stat-icon orange">
                <el-icon><View /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">评论数量</div>
                <div class="stat-value">42492</div>
              </div>
              <div class="stat-icon purple">
                <el-icon><ChatDotRound /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 今年文章贡献度 -->
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>今年文章贡献度</span>
                <div class="legend">
                  <span class="legend-item">
                    <span class="legend-color" style="background: #67C23A;"></span>
                    多
                  </span>
                  <span class="legend-item">
                    <span class="legend-color" style="background: #E6A23C;"></span>
                    中
                  </span>
                  <span class="legend-item">
                    <span class="legend-color" style="background: #F56C6C;"></span>
                    少
                  </span>
                </div>
              </div>
            </template>
            <div class="contribution-chart">
              <div class="months">
                <span v-for="month in months" :key="month" class="month">{{ month }}</span>
              </div>
              <div class="contribution-grid">
                <div v-for="week in 52" :key="week" class="week">
                  <div 
                    v-for="day in 7" 
                    :key="day" 
                    class="day"
                    :class="getContributionLevel()"
                  ></div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 分类统计 -->
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <span>分类统计</span>
            </template>
            <div class="pie-chart">
              <v-chart class="chart" :option="pieOption" />
            </div>
            <div class="pie-legend">
              <div class="legend-item" v-for="item in pieData" :key="item.name">
                <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-text">{{ item.name }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 最近访问情况 -->
    <div class="recent-visits">
      <el-card class="chart-card">
        <template #header>
          <span>最近七天访问情况</span>
        </template>
        <div class="line-chart">
          <v-chart class="chart" :option="lineOption" />
        </div>
      </el-card>
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

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pieData = ref([
  { name: '技术文章', value: 35, color: '#409EFF' },
  { name: '生活随笔', value: 25, color: '#67C23A' },
  { name: '学习笔记', value: 20, color: '#E6A23C' },
  { name: '项目总结', value: 15, color: '#F56C6C' },
  { name: '其他分类', value: 5, color: '#909399' }
])

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

const getContributionLevel = () => {
  const levels = ['level-0', 'level-1', 'level-2', 'level-3']
  return levels[Math.floor(Math.random() * levels.length)]
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.stat-icon.green {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #E6A23C, #EEBC6C);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #9C27B0, #BA68C8);
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 5px;
}

.contribution-chart {
  padding: 20px 0;
}

.months {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.contribution-grid {
  display: flex;
  gap: 2px;
}

.week {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: #EBEEF5;
}

.day.level-1 {
  background: #C6E48B;
}

.day.level-2 {
  background: #7BC96F;
}

.day.level-3 {
  background: #239A3B;
}

.pie-chart {
  height: 200px;
}

.chart {
  height: 100%;
  width: 100%;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
}

.pie-legend .legend-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-text {
  color: #606266;
}

.recent-visits {
  margin-bottom: 20px;
}

.line-chart {
  height: 300px;
}
</style>