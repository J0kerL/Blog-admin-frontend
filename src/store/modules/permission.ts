import { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import { getRouters } from "@/api/system/auth";
import { defineStore } from "pinia";
import { ref } from "vue";
const modules = import.meta.glob("../../views/**/**.vue");
import ParentView from '@/components/ParentView/index.vue'

const Layout = () => import("@/layouts/index.vue");

/**
 * 递归过滤有权限的异步(动态)路由
 *
 * @param routes 接口返回的异步(动态)路由
 * @returns 返回用户有权限的异步(动态)路由
 */
const filterAsyncRoutes = (routes: any[], isRoot = true) => {
  const asyncRoutes: any[] = [];

  routes.forEach((route) => {
    const tmpRoute = { ...route }; // ES6扩展运算符复制新对象
    
    if (!tmpRoute.name) {
      // 确保路由有唯一名称，避免重复
      tmpRoute.name = tmpRoute.path.replace(/\//g, '_');
    }

    // 处理组件，将字符串转换为实际的组件
    if (tmpRoute.component) {
      if (typeof tmpRoute.component === 'string') {
        if (tmpRoute.component === 'Layout') {
          tmpRoute.component = Layout;
        } else if (tmpRoute.component === 'ParentView') {
          tmpRoute.component = ParentView;
        } else {
          // 处理组件路径
          let componentPath = '';
          
          // 处理以@开头的路径
          if (tmpRoute.component.startsWith('@/views/')) {
            // 将 @/views/ 替换为 ../../views/
            componentPath = `../../${tmpRoute.component.replace('@/', '')}.vue`;
          } else if (tmpRoute.component.startsWith('/')) {
            // 以/开头的路径
            componentPath = `../../views${tmpRoute.component}.vue`;
          } else {
            // 其他情况，假设是相对路径
            componentPath = `../../views/${tmpRoute.component}.vue`;
          }
          
          console.log('尝试加载组件:', componentPath);
          const component = componentPath ? modules[componentPath] : null;
          
          if (component) {
            tmpRoute.component = component;
          } else {
            console.error(`找不到组件: ${componentPath}，原始路径: ${tmpRoute.component}`);
            
            // 如果所有尝试都失败，使用404页面
            console.error('组件路径解析失败，使用404页面');
            tmpRoute.component = () => import('@/views/error-page/404.vue');
          }
        }
      }

      // 处理子路由
      if (tmpRoute.children && tmpRoute.children.length > 0) {
        tmpRoute.children = filterAsyncRoutes(tmpRoute.children, false);
      }
    }

    asyncRoutes.push(tmpRoute);
  });

  // 只在处理根级路由时添加404路由
  if (isRoot) {
    asyncRoutes.push({
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error-page/404.vue'),
      meta: {
        title: '404',
        hidden: true
      }
    });
  }

  return asyncRoutes;
};

// setup
export const usePermissionStore = defineStore("permission", () => {
  // state
  const routes = ref<RouteRecordRaw[]>([]);

  // actions
  function setRoutes(newRoutes: any[]) {
    routes.value = constantRoutes.concat(newRoutes as RouteRecordRaw[]);
  }
  /**
   * 生成动态路由
   *
   * @returns
   */
  function generateRoutes() {
    return new Promise<any[]>((resolve, reject) => {
      // 接口获取所有路由
      console.log('开始获取路由配置');
      getRouters()
        .then(({ data: asyncRoutes }) => {
          console.log('获取路由配置成功:', asyncRoutes);
          // 过滤和处理路由
          const accessedRoutes = filterAsyncRoutes(asyncRoutes);
          console.log('过滤后的路由:', accessedRoutes);
          setRoutes(accessedRoutes);
          resolve(accessedRoutes);
        })
        .catch((error) => {
          console.error('获取路由配置失败:', error);
          // 如果获取路由失败，使用默认路由
          const defaultRoutes: any[] = [];
          setRoutes(defaultRoutes);
          resolve(defaultRoutes);
        });
    });
  }
  /**
   * 获取与激活的顶部菜单项相关的混合模式左侧菜单集合
   */
  const mixLeftMenus = ref<RouteRecordRaw[]>([]);
  function setMixLeftMenus(topMenuPath: string) {
    const matchedItem = routes.value.find((item) => item.path === topMenuPath);
    if (matchedItem && matchedItem.children) {
      mixLeftMenus.value = matchedItem.children;
    }
  }
  return {
    routes,
    setRoutes,
    generateRoutes,
    mixLeftMenus,
    setMixLeftMenus,
  };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
