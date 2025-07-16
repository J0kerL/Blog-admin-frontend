import router from '@/router'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore, useSettingsStore } from '@/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
NProgress.configure({ showSpinner: false })

const whiteList = ['/login'] // 路由白名单
// 添加路由加载状态标记
let routesLoaded = false

export function setupPermission() {
  router.beforeEach(async (to, from, next) => {
    const dynamicTitle = useSettingsStore().dynamicTitle
    if (dynamicTitle && to.meta.title) {
      document.title = to.meta.title as string
    }
    NProgress.start();
    const hasToken = getToken();
    
    if (hasToken) {
      if (to.path === "/login") {
        // 如果已登录，跳转首页
        next({ path: "/" });
        NProgress.done();
      } else {
        const userStore = useUserStore();
        const permissionStore = usePermissionStore();
        
        // 判断是否已经获取过用户信息和加载过路由
        if (!userStore.user.nickname && !routesLoaded) {
          try {
            // 获取用户信息
            await userStore.getUserInfo();
            // 生成可访问路由
            const accessRoutes = await permissionStore.generateRoutes();
            
            // 添加路由前检查和打印日志
            if (Array.isArray(accessRoutes) && accessRoutes.length > 0) {
              accessRoutes.forEach((route: any) => {
                if (route && typeof route === 'object') {
                  if(route.meta?.isExternal) {
                    return;
                  }
                  router.addRoute(route);
                } else {
                  console.error('Invalid route object:', route);
                }
              });
              
              // 标记路由已加载
              routesLoaded = true;
              
              // 重定向到目标页面
              // 这里使用 replace: true 避免在历史记录中留下重定向记录
              next({ ...to, replace: true });
            } else {
              console.log('没有动态路由，使用默认路由');
              routesLoaded = true;
              next();
            }
          } catch (error) {
            console.error('Permission error:', error);
            // 移除 token 并跳转登录页
            await userStore.resetToken();
            // 重置路由加载状态
            routesLoaded = false;
            next(`/login`);
            NProgress.done();
          }
        } else {
          // 已经有用户信息或路由已加载，直接放行
          next();
        }
      }
    } else {
      // 重置路由加载状态
      routesLoaded = false;
      // 未登录可以访问白名单页面
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        next(`/login`);
        NProgress.done();
      }
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

