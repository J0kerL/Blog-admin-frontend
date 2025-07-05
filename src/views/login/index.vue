<template>
  <div class="login-container" :class="{ dark: isDark }">
    <!-- 左侧背景区域 -->
    <div class="login-background">
      <div class="background-wrapper">
        <!-- 添加简单的装饰图形 -->
        <div class="animated-background">
          <div class="gradient-circle"></div>
          <div class="geometric-shapes">
            <div class="shape" v-for="n in 5" :key="n"></div>
          </div>
        </div>

        <!-- 标题区域 -->
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
        <!-- 主题切换按钮 -->
        <div class="theme-switch">
          <el-button class="theme-button" circle @click="toggleTheme">
            <el-icon><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
          </el-button>
        </div>

        <h2 class="welcome-text">欢迎回来</h2>
        <p class="login-tip">请使用您的账号密码登录系统</p>

        <!-- 登录表单内容 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          @keyup.enter="handleLogin"
        >
            <el-form-item prop="account">
              <el-input
                v-model="loginForm.account"
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
            <el-form-item prop="captcha">
              <div class="captcha-wrapper">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="Picture"
                  style="flex: 1; margin-right: 10px;"
                />
                <div class="captcha-image" @click="generateCaptcha">
                  <canvas ref="captchaCanvas" width="150" height="43"></canvas>
                </div>
              </div>
            </el-form-item>

            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <span class="forget-password" @click="goToForgotPassword">忘记密码？</span>
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
      </div>

      <!-- 移除滑动验证对话框 -->


    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useSettingsStore } from "@/store/modules/settings";
import settings from "@/config/settings";
// 移除滑动验证相关导入


const userStore = useUserStore();
const settingsStore = useSettingsStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

// 移除滑动验证相关变量
const captchaCanvas = ref<HTMLCanvasElement>();
const captchaText = ref('');

const loginForm = reactive({
  account: "",
  password: "",
  captcha: "",
});

const rules = {
  account: [
    { required: true, message: "请输入用户名或邮箱", trigger: "blur" },
    { min: 3, max: 50, message: "长度在 3 到 50 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 4, max: 20, message: "长度在 4 到 20 个字符", trigger: "blur" },
  ],
  captcha: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value.toLowerCase() !== captchaText.value.toLowerCase()) {
          callback(new Error('验证码错误'));
        } else {
          callback();
        }
      }, 
      trigger: "blur" 
    },
  ],
};

const isDark = computed(() => settingsStore.theme === "dark");

// 移除refresh方法

const login = () => {
  loading.value = true;
  // 只传递后端需要的字段
  const loginData = {
    account: loginForm.account,
    password: loginForm.password
  };
  
  userStore
    .login(loginData)
    .then(() => {
      ElMessage.success("登录成功");
      // 登录成功后直接跳转到首页，路由守卫会处理权限和路由生成
      router.push("/dashboard");
    })
    .catch((error) => {
      // 登录失败时重新生成验证码并清空输入
      generateCaptcha();
      loginForm.captcha = '';
      ElMessage.error(error.message || "登录失败，请检查用户名和密码");
    })
    .finally(() => {
      loading.value = false;
    });
};


// 移除滑动验证相关方法

const toggleTheme = () => {
  const newTheme = isDark.value ? "light" : "dark";
  settingsStore.saveSettings({ theme: newTheme });
};

// 生成随机验证码
const generateCaptcha = () => {
  const canvas = captchaCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 生成随机字符串
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  captchaText.value = code;
  
  // 设置背景
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f0f0f0');
  gradient.addColorStop(1, '#e0e0e0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }
  
  // 绘制验证码文字
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  for (let i = 0; i < code.length; i++) {
    ctx.font = `${20 + Math.random() * 10}px Arial`;
    ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`;
    
    const x = (canvas.width / code.length) * i + (canvas.width / code.length) / 2;
    const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
    const angle = (Math.random() - 0.5) * 0.5;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }
  
  // 绘制干扰点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const handleLogin = async () => {
  loginFormRef.value?.validate((flag) => {
    if (flag) {
      // 验证图片验证码
      if (loginForm.captcha.toLowerCase() !== captchaText.value.toLowerCase()) {
        ElMessage.error('验证码错误');
        generateCaptcha();
        loginForm.captcha = '';
        return;
      }
      login();
    }
  });
};

// 跳转到忘记密码页面
const goToForgotPassword = () => {
  router.push('/forgot-password');
};



// 页面加载时生成验证码
onMounted(() => {
  generateCaptcha();
});




</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: var(--el-bg-color);
}

/* 左侧背景区域样式 */
.login-background {
  flex: 1;
  position: relative;
  background-image: url('/login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;

  .background-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3); /* 添加半透明遮罩 */
  }

  /* 品牌内容样式优化 */
  .brand-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 40px;



    .brand-title {
      font-size: 36px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16px;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .brand-description {
      font-size: 16px;
      color: #ffffff;
      max-width: 400px;
      margin: 0 auto;
      line-height: 1.6;
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }
  }
}

/* 移除之前的动画相关样式 */
.animated-background,
.gradient-circle,
.geometric-shapes {
  display: none;
}

/* 右侧登录表单区域样式 */
.login-form {
  width: 500px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--el-bg-color);
  position: relative;
  box-shadow: -10px 0 20px rgba(0, 0, 0, 0.05);

  .form-wrapper {
    max-width: 400px;
    width: 100%;
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



/* 主题切换按钮样式 */
.theme-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;

  .theme-button {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: none;
    color: var(--el-text-color-primary);
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
  }
}

/* 验证码样式 */
.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;

  .captcha-image {
    cursor: pointer;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
    }

    canvas {
      display: block;
      background: #f5f5f5;
    }
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
    cursor: pointer;
    transition: all 0.3s;
    user-select: none;

    &:hover {
      color: var(--el-color-primary);
      text-decoration: none;
    }
  }
}

/* 深色模式适配 */
.dark {
  .login-form {
    background: var(--el-bg-color-overlay);

    :deep(.el-input__wrapper) {
      background: rgba(0, 0, 0, 0.2);

      &:hover,
      &.is-focus {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .theme-switch {
    .theme-button {
      background: rgba(0, 0, 0, 0.2);

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .logo-wrapper {
    :deep(svg path) {
      fill: #2196f3;
    }
  }
}

/* 更新动画 */
@keyframes matrixMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 30px;
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes rotateBorder {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
