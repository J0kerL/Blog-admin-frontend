import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layouts/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
        meta: { hidden: true }
      }
    ]
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error-page/404.vue'),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "仪表盘",
          icon: "Orange",
          affix: true,
          keepAlive: true,
          alwaysShow: false,
        },
      },
    ],
  },

  {
    path: "/system",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "profile",
        component: () => import("@/views/profile/index.vue"),
        name: "Profile",
        meta: {
          title: "个人中心",
          icon: "User",
          keepAlive: true,
          alwaysShow: false,
          hidden: true,
        },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

/**
 * 重置路由
 */
export function resetRouter() {
  // 获取所有路由
  const routes = router.getRoutes();
  // 移除所有动态添加的路由
  routes.forEach(route => {
    // 只移除非静态路由
    const isStaticRoute = constantRoutes.some(
      staticRoute => staticRoute.path === route.path
    );
    if (!isStaticRoute && route.name) {
      router.removeRoute(route.name);
    }
  });
  // 重定向到登录页
  router.replace({ path: "/login" });
}

export default router;
