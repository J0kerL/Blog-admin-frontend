import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import MenuManage from '../views/MenuManage.vue'
import CommentManage from '../views/CommentManage.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import Layout from '../components/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      {
        path: '/menu',
        name: 'MenuManage',
        component: MenuManage,
        meta: { requiresAuth: true }
      },
      {
        path: '/comment',
        name: 'CommentManage',
        component: CommentManage,
        meta: { requiresAuth: true }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: { requiresAuth: true }
      }
    ]
  },
  // 添加通配符路由，重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录 - 使用Authorization作为token名称与后端保持一致
  const isAuthenticated = localStorage.getItem('Authorization')
  
  // 如果路由需要认证且用户未登录，则重定向到登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    // 如果用户已登录且尝试访问登录页，则重定向到首页
    if (to.path === '/login' && isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router