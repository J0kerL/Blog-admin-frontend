import { ref } from "vue";
import { defineStore } from 'pinia';
import { loginApi,getUserInfoApi,logoutApi } from "@/api/system/auth";
import { resetRouter } from "@/router";
import { store } from "@/store";
import { setToken,removeToken } from "@/utils/auth";

export const useUserStore = defineStore("user", () => {
  const user = ref({
    id: null,
    username: null,
    avatar: null,
    email: null,
    sex: null,
    roleId: null,
    status: null,
    nickname: null,
    roles: [],
    intro: null,
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
          const { data } = response;
          // 确保token存在且正确设置
          if (data && data.token) {
            setToken(data.token);
            resolve();
          } else {
            console.error('登录响应中没有token:', data);
            reject(new Error("登录失败，未获取到有效的token"));
          }
        })
        .catch((error) => {
          console.error('登录请求失败:', error);
          reject(error);
        });
    });
  }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getUserInfo() {
    return new Promise<any>((resolve, reject) => {
      getUserInfoApi()
        .then(({ data }) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          // 兼容后端UserVO结构
          user.value = {
            ...user.value,
            id: data.id,
            username: data.username,
            avatar: data.avatar,
            email: data.email,
            sex: data.sex,
            roleId: data.roleId,
            status: data.status,
            // nickname优先展示username
            nickname: data.nickname || data.username || '用户',
            permissions: data.permissions || [],
            roles: data.roles || [],
            intro: data.intro || null
          };
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
          removeToken();
          // 重置用户信息
          user.value = {
            id: null,
            username: null,
            avatar: null,
            email: null,
            sex: null,
            roleId: null,
            status: null,
            nickname: null,
            roles: [],
            intro: null,
            permissions: []
          };
          // 跳转到登录页
          resetRouter();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // remove token
  function resetToken() {
    console.log("resetToken");
    return new Promise<void>((resolve) => {
      removeToken();
      // 重置用户信息
      user.value = {
        id: null,
        username: null,
        avatar: null,
        email: null,
        sex: null,
        roleId: null,
        status: null,
        nickname: null,
        roles: [],
        intro: null,
        permissions: []
      };
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
