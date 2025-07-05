import { ref } from "vue";
import { defineStore } from 'pinia';
import { loginApi,getUserInfoApi,logoutApi } from "@/api/system/auth";
import { resetRouter } from "@/router";
import { store } from "@/store";
import { setToken, getToken, removeToken } from "@/utils/auth";
import { usePermissionStore } from "@/store/modules/permission";

interface UserState {
  id: number | null;
  username: string | null;
  status: number | null;
  avatar: string | null;
  email: string | null;
  sex: number | null;
  roleId: number | null;
  roles: string[];
  permissions: string[];
}

export const useUserStore = defineStore("user", () => {
  const user = ref({
    id: null,
    username: null,
    status: null,
    avatar: null,
    email: null,
    sex: null,
    roleId: null,
    roles: [],
    permissions: []
  });

  /**
   * 登录
   *
   * @param {LoginData}
   * @returns
   */
  function login(loginData: any) {
    return new Promise<void>((resolve, reject) => {
      loginApi(loginData)
        .then((response) => {
          // 响应拦截器已经返回了response.data，所以这里response就是后端的Result对象
          if (response && response.data && response.data.token) {
            const tokenSet = setToken(response.data.token);
            if (tokenSet) {
              // 登录成功后直接保存用户信息，不再调用getUserInfo
              const userData = {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                status: 1,
                avatar: null,
                sex: null,
                roleId: null,
                roles: [],
                permissions: []
              };
              Object.assign(user.value, userData);
              console.log('登录成功 - 用户名:', userData.username, '| Token:', response.data.token)
              resolve();
            } else {
              reject(new Error('Token保存失败'));
            }
          } else {
            reject(new Error('登录响应数据格式错误'));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getUserInfo() {
    return new Promise<any>((resolve, reject) => {
      getUserInfoApi()
        .then((response) => {
          // 响应拦截器已经返回了response.data，所以这里response就是后端的Result对象
          if (!response || !response.data) {
            reject("Verification failed, please Login again.");
            return;
          }
          const { data } = response;
          Object.assign(user.value, { ...data });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // user logout
  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          removeToken()
          location.reload(); // 清空路由
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // remove token
  function resetToken() {
    return new Promise<void>((resolve) => {
      // 清空用户信息
      Object.assign(user.value, {
        id: null,
        username: null,
        status: null,
        avatar: null,
        email: null,
        sex: null,
        roleId: null,
        roles: [],
        permissions: []
      });
      // 清空权限路由
      const permissionStore = usePermissionStore();
      permissionStore.resetRoutes();
      removeToken();
      resetRouter();
      resolve();
    });
  }

  return {
    user,
    login,
    getUserInfo,
    logout,
    resetToken,
  };
});

// 非setup
export function useUserStoreHook() {
  return useUserStore(store);
}
