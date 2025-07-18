import { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import { getRouters } from "@/api/system/auth";
import { defineStore } from "pinia";
import { ref } from "vue";
const modules = import.meta.glob("../../views/**/**.vue");
import ParentView from "@/components/ParentView/index.vue";

const Layout = () => import("@/layouts/index.vue");

/**
 * 将后端菜单数据转换为前端路由格式
 *
 * @param menus 后端返回的菜单数据
 * @returns 返回转换后的路由数组
 */
const convertMenusToRoutes = (menus: any[]): any[] => {
  const routes: any[] = [];

  menus.forEach((menu) => {
    // 跳过隐藏的菜单
    if (menu.hidden === 1) {
      return;
    }

    const route: any = {
      path: menu.path,
      name: menu.path.replace(/\//g, "_") || `Menu_${menu.id}`,
      meta: {
        title: menu.title,
        icon: menu.icon,
        hidden: menu.hidden === 1,
        keepAlive: true,
        alwaysShow: false,
      },
    };

    // 处理组件
    if (menu.component) {
      if (menu.component === "Layout") {
        route.component = Layout;
      } else if (menu.component === "ParentView") {
        route.component = ParentView;
      } else {
        // 如果是顶级菜单且没有子菜单，使用Layout包装
        if (!menu.children || menu.children.length === 0) {
          route.component = Layout;
          // 将原组件作为子路由
          let componentPath = "";
          if (menu.component.startsWith("@/views/")) {
            componentPath = `../../${menu.component.replace("@/", "")}.vue`;
          } else if (menu.component.startsWith("/")) {
            componentPath = `../../views${menu.component}.vue`;
          } else {
            componentPath = `../../views/${menu.component}.vue`;
          }

          const component = modules[componentPath];
          if (component) {
            route.children = [{
              path: '',
              component: component,
              name: route.name + '_child',
              meta: route.meta
            }];
          } else {
            console.warn(`组件未找到: ${componentPath}，使用404页面`);
            route.children = [{
              path: '',
              component: () => import("@/views/error-page/404.vue"),
              name: route.name + '_child',
              meta: route.meta
            }];
          }
        } else {
          // 有子菜单的情况，处理组件路径
          let componentPath = "";
          if (menu.component.startsWith("@/views/")) {
            componentPath = `../../${menu.component.replace("@/", "")}.vue`;
          } else if (menu.component.startsWith("/")) {
            componentPath = `../../views${menu.component}.vue`;
          } else {
            componentPath = `../../views/${menu.component}.vue`;
          }

          const component = modules[componentPath];
          if (component) {
            route.component = component;
          } else {
            console.warn(`组件未找到: ${componentPath}，使用404页面`);
            route.component = () => import("@/views/error-page/404.vue");
          }
        }
      }
    }

    // 处理子菜单
    if (menu.children && menu.children.length > 0) {
      route.children = convertMenusToRoutes(menu.children);
    }

    routes.push(route);
  });

  return routes;
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
      console.log("开始获取路由配置");
      getRouters()
        .then(({ data: asyncRoutes }) => {
          console.log("获取路由配置成功:", asyncRoutes);

          // 将后端菜单数据转换为前端路由格式
          const accessedRoutes = convertMenusToRoutes(asyncRoutes || []);
          setRoutes(accessedRoutes);
          resolve(accessedRoutes);
        })
        .catch((error) => {
          console.error("获取路由配置失败:", error);
          console.error("错误详情:", error.response || error.message);
          reject(error);
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
