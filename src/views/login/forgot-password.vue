<template>
  <div class="forgot-password-container" :class="{ dark: isDark }">
    <!-- 左侧背景区域 -->
    <div class="login-background">
      <div class="background-wrapper">
        <!-- 标题区域 -->
        <div class="brand-content">
          <h1 class="brand-title">{{ settings.title }}</h1>
          <p class="brand-description">
            基于 Vue3 + TypeScript 打造的现代化博客系统
          </p>
        </div>
      </div>
    </div>

    <!-- 右侧忘记密码表单区域 -->
    <div class="forgot-form">
      <div class="form-wrapper">
        <!-- 主题切换按钮 -->
        <div class="theme-switch">
          <el-button class="theme-button" circle @click="toggleTheme">
            <el-icon><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
          </el-button>
        </div>

        <h2 class="welcome-text">找回密码</h2>
        <p class="forgot-tip">请输入您的邮箱地址，我们将发送重置密码链接到您的邮箱</p>

        <!-- 忘记密码表单 -->
        <el-form
          ref="forgotFormRef"
          :model="forgotForm"
          :rules="forgotRules"
          @keyup.enter="handleSendEmail"
        >
          <el-form-item prop="email">
            <el-input
              v-model="forgotForm.email"
              placeholder="请输入邮箱地址"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-button
            :loading="loading"
            type="primary"
            class="send-button"
            @click="handleSendEmail"
          >
            {{ loading ? "发送中..." : "发送重置链接" }}
          </el-button>
        </el-form>

        <!-- 返回登录 -->
        <div class="back-to-login">
          <el-button type="text" @click="backToLogin">
            <el-icon><ArrowLeft /></el-icon>
            返回登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Moon, Sunny, ArrowLeft } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/store/modules/settings'
import settings from '@/config/settings'

const router = useRouter()
const settingsStore = useSettingsStore()
const forgotFormRef = ref<FormInstance>()
const loading = ref(false)

const forgotForm = reactive({
  email: ''
})

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const isDark = computed(() => settingsStore.theme === 'dark')

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  settingsStore.saveSettings({ theme: newTheme })
}

const handleSendEmail = async () => {
  if (!forgotFormRef.value) return
  
  try {
    await forgotFormRef.value.validate()
    loading.value = true
    
    // TODO: 调用发送重置密码邮件的API
    // await sendResetPasswordEmailApi(forgotForm.email)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('重置密码链接已发送到您的邮箱，请查收')
    
    // 发送成功后返回登录页面
    setTimeout(() => {
      backToLogin()
    }, 1500)
    
  } catch (error) {
    console.error('发送重置密码邮件失败:', error)
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const backToLogin = () => {
  router.push('/login')
}


</script>

<style lang="scss" scoped>
.forgot-password-container {
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

  /* 品牌内容样式 */
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

/* 右侧忘记密码表单区域样式 */
.forgot-form {
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

  .welcome-text {
    font-size: 28px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
    text-align: center;
  }

  .forgot-tip {
    color: var(--el-text-color-secondary);
    margin-bottom: 40px;
    text-align: center;
    line-height: 1.6;
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
    }

    .el-input__inner {
      font-size: 14px;
    }
  }

  .send-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .back-to-login {
    text-align: center;
    
    .el-button {
      color: var(--el-text-color-secondary);
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

/* 主题切换按钮 */
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

/* 深色模式适配 */
.dark {
  .forgot-form {
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
}

/* 动画 */
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