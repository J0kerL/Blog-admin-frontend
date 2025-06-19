<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside class="sidebar" :width="isCollapse ? '64px' : '200px'">
      <div class="logo-container">
        <div class="logo">
<!--          <el-icon><img src="../assets/logo.png" alt="logo"></el-icon>-->
          <span v-show="!isCollapse" class="logo-text">后台管理系统</span>
        </div>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-sub-menu index="/content">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/articles">文章管理</el-menu-item>
          <el-menu-item index="/categories">分类管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/comments">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>评论管理</template>
        </el-menu-item>
        
        <el-menu-item index="/system">
          <el-icon><Tools /></el-icon>
          <template #title>系统管理</template>
        </el-menu-item>
        
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <template #title>日志管理</template>
        </el-menu-item>
        
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleSidebar"
            class="collapse-btn"
          >
            <el-icon><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
          </el-button>
          
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>仪表盘</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-button type="text" class="header-btn">
            <el-icon><Search /></el-icon>
          </el-button>
          
          <el-button type="text" class="header-btn">
            <el-icon><Bell /></el-icon>
          </el-button>
          
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar size="small" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">{{ username || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)

// 从localStorage获取用户名
const username = ref(localStorage.getItem('username'))

const activeMenu = computed(() => {
  return route.path
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      console.log('个人中心')
      break
    case 'settings':
      console.log('设置')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 引入request和ElMessage
import request from '../utils/request'
import { ElMessage } from 'element-plus'

// 处理退出登录
const handleLogout = async () => {
  try {
    // 调用后端退出登录接口
    const response = await request.post('/user/logout')
    
    // 清除本地存储的token和用户信息 - 使用Authorization作为token名称与后端保持一致
    localStorage.removeItem('Authorization')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    
    // 显示退出成功消息
    ElMessage.success(response.msg || '退出登录成功')
    
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error(error.message || '退出登录失败')
    
    // 即使请求失败，也清除本地存储并跳转到登录页
    localStorage.removeItem('Authorization')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #434a50;
}

.logo {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.logo .el-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  white-space: nowrap;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 20px;
  font-size: 18px;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-btn {
  font-size: 18px;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>