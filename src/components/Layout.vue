<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside class="sidebar" :width="isCollapse ? '64px' : '200px'">
      <div class="logo-container">
        <div class="logo">
<!--          <el-icon><img src="../assets/logo.png" alt="logo"></el-icon>-->
          <span v-show="!isCollapse" class="logo-text">Diamond博客后台管理系统</span>
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
        <!-- 动态渲染菜单 -->
        <template v-for="menu in menuList" :key="menu.id">
          <el-menu-item :index="menu.path" v-if="!menu.children || menu.children.length === 0">
            <el-icon>
              <component :is="getIconComponent(menu.icon)" />
            </el-icon>
            <template #title>{{ menu.title }}</template>
          </el-menu-item>
          
          <el-sub-menu :index="menu.path" v-else>
            <template #title>
              <el-icon>
                <component :is="getIconComponent(menu.icon)" />
              </el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item 
              v-for="child in menu.children" 
              :key="child.id" 
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Odometer,
  User,
  Document,
  ChatDotRound,
  Tools,
  Setting,
  Expand,
  Fold,
  Search,
  Bell,
  ArrowDown,
  UserFilled,
  Edit,
  PriceTag,
  Collection,
  ChatLineRound,
  Management,
  Files,
  Folder,
  Star,
  View,
  Lock,
  Unlock
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const menuList = ref([])

// 从localStorage获取用户名
const username = ref(localStorage.getItem('username'))

const activeMenu = computed(() => {
  return route.path
})

// 图标组件映射
const iconMap = {
  // 仪表盘
  'Odometer': Odometer,
  // 用户相关
  'User': User,
  'UserFilled': UserFilled,
  // 角色权限相关
  'Lock': Lock,
  'Unlock': Unlock,
  // 文档文章相关
  'Document': Document,
  'Edit': Edit,
  'Files': Files,
  // 分类标签相关
  'Collection': Collection,
  'Folder': Folder,
  'PriceTag': PriceTag,
  'Star': Star,
  // 评论相关
  'ChatDotRound': ChatDotRound,
  'ChatLineRound': ChatLineRound,
  // 系统管理相关
  'Tools': Tools,
  'Setting': Setting,
  'Management': Management,
  // 其他
  'View': View
}

// 获取图标组件
const getIconComponent = (iconName) => {
  return iconMap[iconName] || Document
}

// 获取菜单数据
const getMenuList = async () => {
  try {
    const response = await request.get('/menu/getMenu')
    menuList.value = response.data || []
  } catch (error) {
    console.error('获取菜单失败:', error)
    ElMessage.error('获取菜单失败')
    // 如果获取菜单失败，使用默认菜单
    menuList.value = [
      {
        id: 1,
        title: '仪表盘',
        name: 'Dashboard',
        path: '/dashboard',
        component: 'Dashboard',
        icon: 'Odometer',
        sort: 1,
        isExternal: 0
      }
    ]
  }
}

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

// 组件挂载时获取菜单
onMounted(() => {
  getMenuList()
})

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