<template>
  <div class="login-container" :class="{ dark: isDark }">
    <!-- 左侧背景区域 -->
    <div class="login-background">
      <div class="background-wrapper">
        <!-- Logo和标题区域 -->
        <div class="brand-content">
          <h1 class="brand-title">{{ settings.title }}</h1>
          <p class="brand-description">
            基于 Vue3 + TypeScript 打造的现代化博客系统
          </p>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="login-form">
      <div class="form-wrapper">


        <h2 class="welcome-text">{{ isForgetPassword ? '重置密码' : '欢迎回来' }}</h2>
        <p class="login-tip">{{ isForgetPassword ? '请输入您的账号和密码信息' : '请使用您的账号密码登录系统' }}</p>


        <!-- 登录表单内容 -->
        <el-form
            v-if="!isForgetPassword"
            ref="loginFormRef"
            :model="loginForm"
            :rules="rules"
            @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名或邮箱"
                prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
            />
          </el-form-item>

          <el-form-item prop="captchaCode">
            <div class="captcha-wrapper">
              <el-input
                  v-model="loginForm.captchaCode"
                  placeholder="请输入验证码"
                  prefix-icon="Picture"
              />
              <img
                  :src="captchaImage"
                  alt="验证码"
                  class="captcha-image"
                  @click="refreshCaptcha"
                  title="点击刷新验证码"
              />
            </div>
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="javascript:void(0)" class="forget-password" @click="toggleForgetPassword">忘记密码？</a>
          </div>

          <el-button
              :loading="loading"
              type="primary"
              class="login-button"
              @click="handleLogin"
          >
            {{ loading ? "登录中..." : "登录" }}
          </el-button>
        </el-form>
        
        <!-- 忘记密码表单 -->
        <el-form
            v-else
            ref="forgetPasswordFormRef"
            :model="forgetPasswordForm"
            :rules="forgetPasswordRules"
            @keyup.enter="handleForgetPassword"
        >
          <el-form-item prop="username">
            <el-input
                v-model="forgetPasswordForm.username"
                placeholder="请输入用户名或邮箱"
                prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="oldPassword">
            <el-input
                v-model="forgetPasswordForm.oldPassword"
                type="password"
                placeholder="请输入旧密码"
                prefix-icon="Lock"
                show-password
            />
          </el-form-item>
          <el-form-item prop="newPassword">
            <el-input
                v-model="forgetPasswordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                prefix-icon="Lock"
                show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
                v-model="forgetPasswordForm.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                prefix-icon="Lock"
                show-password
            />
          </el-form-item>
          
          <div class="login-options">
            <a href="javascript:void(0)" class="back-to-login" @click="toggleForgetPassword">返回登录</a>
          </div>
          
          <el-button
              :loading="resetLoading"
              type="primary"
              class="login-button"
              @click="handleForgetPassword"
          >
            {{ resetLoading ? "提交中..." : "重置密码" }}
          </el-button>
        </el-form>
      </div>

      <!-- 滑块验证 -->
      <el-dialog
          title="请拖动滑块完成拼图"
          width="360px"
          v-model="showSliderVerify"
          :close-on-click-modal="false"
          @closed="refresh"
          append-to-body
      >
        <slider-verify
            ref="sliderVerifyRef"
            @success="onSuccess"
            @fail="onFail"
            @again="onAgain"
        />
      </el-dialog>


    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import type {FormInstance} from "element-plus";
import {ElMessage} from "element-plus";
import {useUserStore} from "@/store/modules/user";
import {useSettingsStore} from "@/store/modules/settings";
import Logo from "@/layouts/components/Sidebar/Logo.vue";
import settings from "@/config/settings";
import SliderVerify from "./components/SliderVerify.vue";
import {getCaptchaSwitchApi} from "@/api/system/auth";

const QrCode = markRaw({
  name: "QrCode",
  render() {
    return h(
        "svg",
        {
          viewBox: "0 0 1024 1024",
          width: "1em",
          height: "1em",
          fill: "currentColor",
        },
        [
          h("path", {
            d: "M468 128H160c-17.7 0-32 14.3-32 32v308c0 4.4 3.6 8 8 8h332c4.4 0 8-3.6 8-8V136c0-4.4-3.6-8-8-8zm-56 284H192V192h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm444-140H556c-4.4 0-8 3.6-8 8v332c0 4.4 3.6 8 8 8h276c4.4 0 8-3.6 8-8V160c0-17.7-14.3-32-32-32zm-56 284H556V192h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zM192 556v308c0 17.7 14.3 32 32 32h308c4.4 0 8-3.6 8-8V556c0-4.4-3.6-8-8-8H160c-4.4 0-8 3.6-8 8zm56 284V556h220v284H192zm-64-220h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm500 220c0 4.4 3.6 8 8 8h108v108c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V556c0-4.4-3.6-8-8-8H556c-4.4 0-8 3.6-8 8v332zm64-216h108v108H748V624z",
          }),
        ]
    );
  },
});
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);


const showSliderVerify = ref(false);
const sliderVerifyRef = ref();

const loginForm = reactive({
  username: "",
  password: "",
  captchaCode: "",
  captchaKey: "",
  rememberMe: false,
  source: "ADMIN",
  nonceStr: "",
  value: "",
});

const captchaImage = ref("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUJDRDwvdGV4dD48L3N2Zz4=");

// 刷新验证码
// 在 refreshCaptcha 函数中修改字体大小
const refreshCaptcha = () => {
  // 生成随机验证码
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 生成随机颜色
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const bgColor = '#f8f9fa';
  const textColor = colors[Math.floor(Math.random() * colors.length)];

  // 生成干扰线
  let lines = '';
  for (let i = 0; i < 3; i++) {
    const x1 = Math.random() * 100;
    const y1 = Math.random() * 40;
    const x2 = Math.random() * 100;
    const y2 = Math.random() * 40;
    const lineColor = colors[Math.floor(Math.random() * colors.length)];
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor}" stroke-width="1" opacity="0.3"/>`;
  }

  // 生成干扰点
  let dots = '';
  for (let i = 0; i < 20; i++) {
    const cx = Math.random() * 100;
    const cy = Math.random() * 40;
    const dotColor = colors[Math.floor(Math.random() * colors.length)];
    dots += `<circle cx="${cx}" cy="${cy}" r="1" fill="${dotColor}" opacity="0.4"/>`;
  }

  // 为每个字符添加随机位置和旋转
  let textElements = '';
  for (let i = 0; i < code.length; i++) {
    const x = 15 + i * 20 + (Math.random() - 0.5) * 8;
    const y = 25 + (Math.random() - 0.5) * 6;
    const rotation = (Math.random() - 0.5) * 30;
    const charColor = colors[Math.floor(Math.random() * colors.length)];
    textElements += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${charColor}" transform="rotate(${rotation} ${x} ${y})">${code[i]}</text>`;
  }

  const svg = `<svg width="100" height="44" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="44" fill="${bgColor}" rx="4"/>
    ${lines}
    ${dots}
    ${textElements}
  </svg>`;

  captchaImage.value = `data:image/svg+xml;base64,${btoa(svg)}`;
  loginForm.captchaKey = Date.now().toString();
};

const rules = {
  username: [
    {required: true, message: "请输入用户名或邮箱", trigger: "blur"},
    {min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur"},
  ],
  password: [
    {required: true, message: "请输入密码", trigger: "blur"},
    {min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur"},
  ],
  captchaCode: [
    {required: true, message: "请输入验证码", trigger: "blur"},
  ],
};

const isDark = computed(() => settingsStore.theme === "dark");

const refresh = () => {
  sliderVerifyRef.value?.refresh();
};

const onSuccess = (captcha: any) => {
  loginForm.nonceStr = captcha.nonceStr;
  loginForm.value = captcha.value;

  login();
};

const login = () => {
  loading.value = true;
  userStore
      .login(loginForm)
      .then(() => {
        sliderVerifyRef?.value?.verifySuccessEvent();
        router.push("/");
        ElMessage.success("登录成功");
      })
      .catch(() => {
        refresh();
      })
      .finally(() => {
        loading.value = false;
      });
};


/* 滑动验证失败*/
const onFail = (msg: string) => {
  refresh();
};
/* 滑动验证异常*/
const onAgain = () => {
  ElMessage.error("滑动操作异常，请重试");
};


const handleLogin = async () => {
  loginFormRef.value?.validate((flag) => {
    getCaptchaSwitchApi().then((res) => {
      if (!res.data || res.data.configValue === "Y") {
        showSliderVerify.value = true;
      } else {
        login();
      }
    });
  });
};


// 添加 logo 颜色计算
const logoColor = computed(() => {
  return isDark.value ? "#4ecdc4" : "#ff6b6b";
});

// 组件挂载时初始化验证码
onMounted(() => {
  refreshCaptcha();
});
// 在现有的 ref 声明后添加忘记密码相关状态
const isForgetPassword = ref(false);
const resetLoading = ref(false);
const forgetPasswordFormRef = ref<FormInstance>();

// 忘记密码表单数据
const forgetPasswordForm = reactive({
  username: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

// 忘记密码表单验证规则
const forgetPasswordRules = {
  username: [
    { required: true, message: "请输入用户名或邮箱", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" },
  ],
  oldPassword: [
    { required: true, message: "请输入旧密码", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== forgetPasswordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
};

// 切换登录/忘记密码表单
const toggleForgetPassword = () => {
  isForgetPassword.value = !isForgetPassword.value;
  // 清空表单数据
  if (isForgetPassword.value) {
    Object.assign(forgetPasswordForm, {
      username: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  } else {
    Object.assign(loginForm, {
      username: "",
      password: "",
      captchaCode: "",
      captchaKey: "",
      rememberMe: false,
      source: "ADMIN",
      nonceStr: "",
      value: "",
    });
    refreshCaptcha();
  }
};

// 处理忘记密码
const handleForgetPassword = () => {
  forgetPasswordFormRef.value?.validate((valid) => {
    if (valid) {
      resetLoading.value = true;
      // 这里应该调用重置密码的API
      // 示例代码，实际需要根据后端API调整
      setTimeout(() => {
        ElMessage.success("密码重置成功，请重新登录");
        resetLoading.value = false;
        toggleForgetPassword();
      }, 2000);
    }
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: url('@/assets/login-bg.png') center/cover no-repeat;
}

/* 左侧背景区域样式 */
.login-background {
  flex: 1;
  position: relative;
  overflow: hidden;

  .background-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }

  /* 品牌内容样式优化 */
  .brand-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 40px;

    .logo-wrapper {
      margin-bottom: 30px;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        inset: -30px;
        border: 2px solid rgba(33, 150, 243, 0.3);
        border-radius: 50%;
        animation: rotateBorder 10s linear infinite;
      }

      &::after {
        content: "";
        position: absolute;
        inset: -15px;
        background: radial-gradient(
                circle,
                rgba(33, 150, 243, 0.4),
                transparent 70%
        );
        filter: blur(15px);
        animation: glowPulse 4s ease-in-out infinite;
      }
    }

    .brand-title {
      font-size: 36px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 16px;
      text-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
    }

    .brand-description {
      font-size: 16px;
      color: #090b0c;
      max-width: 400px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }
}


/* 右侧登录表单区域样式 */
.login-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  margin: 40px;
  max-width: 500px;

  .form-wrapper {
    max-width: 400px;
    width: 100%;
    padding: 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }


  /* 表单项样式 */
  :deep(.el-form-item) {
    margin-bottom: 24px;

    .el-input__wrapper {
      padding: 0 15px;
      height: 44px;
      border-radius: 8px;
      background: var(--el-fill-color-light);
      border: 2px solid transparent;
      transition: all 0.3s;

      &:hover,
      &.is-focus {
        border-color: var(--el-color-primary);
        background: var(--el-bg-color);
      }

      .el-input__inner {
        font-size: 14px;
      }
    }
  }

  /* 验证码样式 */
  .captcha-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;

    .captcha-image {
      width: 160px;
      height: 45px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        transform: scale(1.05);
      }
    }
  }

  /* 登录按钮 */
  .login-button {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    margin-top: 10px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
    }
  }


}

/* 动画相关 */


@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}


/* 登录选项样式 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;

  .el-checkbox {
    color: var(--el-text-color-regular);
  }

  .forget-password {
    color: var(--el-text-color-regular);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      color: var(--el-color-primary);
    }
  }
  
  // 添加返回登录按钮样式，与忘记密码按钮一致
  .back-to-login {
    color: var(--el-text-color-regular);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

/* 深色模式适配 */
.dark {
  .login-form {
    .form-wrapper {
      color: var(--el-text-color-primary);
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);

      &:hover,
      &.is-focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: var(--el-color-primary);
      }
    }

    .captcha-image {
      border-color: rgba(255, 255, 255, 0.2);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }


  .logo-wrapper {
    :deep(svg path) {
      fill: #2196f3;
    }
  }
}


</style>
