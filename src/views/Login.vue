<template>
  <div class="login-container">
    <div class="login-left">
      <div class="system-title">
        <h1>Diamond个人博客后台管理系统</h1>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-container">
        <!-- 登录表单 -->
        <div v-if="!showForgotPassword">
          <h1 class="welcome-title">欢迎回来</h1>
          <p class="welcome-subtitle">请输入您的账号和密码登录</p>
          
          <el-form :model="loginForm" :rules="formRules" ref="loginFormRef" class="login-form" @submit.prevent="handleLogin" @keyup.enter="handleLogin">
            <el-form-item prop="account">
              <el-input
                v-model="loginForm.account"
                placeholder="请输入用户名或邮箱"
                prefix-icon="User"
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="Iphone"
                  style="flex: 1; margin-right: 10px;"
                  @keyup.enter="handleLogin"
                />
                <div class="captcha-image" @click="refreshCaptcha" :style="captchaStyle">
                  <canvas ref="captchaCanvas"></canvas>
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
                <el-link type="primary" class="forgot-password" :underline="false" @click="showForgotPasswordForm">忘记密码？</el-link>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="form-button primary-button"
                @click="handleLogin"
                :loading="loading"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 忘记密码表单 -->
        <div v-else>
          <h1 class="welcome-title">重置密码</h1>
          <p class="welcome-subtitle">请输入您的账号信息和新密码</p>
          
          <el-form :model="forgotForm" :rules="forgotFormRules" ref="forgotFormRef" class="login-form" @submit.prevent="handleForgotPassword" @keyup.enter="handleForgotPassword">
            <el-form-item prop="account">
              <el-input
                v-model="forgotForm.account"
                placeholder="请输入用户名或邮箱"
                prefix-icon="User"
                @keyup.enter="handleForgotPassword"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="forgotForm.password"
                type="password"
                placeholder="请输入新密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleForgotPassword"
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="forgotForm.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleForgotPassword"
              />
            </el-form-item>
            
            <el-form-item prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="forgotForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="Iphone"
                  style="flex: 1; margin-right: 10px;"
                  @keyup.enter="handleForgotPassword"
                />
                <div class="captcha-image" @click="refreshCaptcha" :style="captchaStyle">
                  <canvas ref="captchaCanvas"></canvas>
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <div class="forgot-password-buttons">
                <el-button
                  type="primary"
                  size="large"
                  class="form-button primary-button"
                  @click="handleForgotPassword"
                  :loading="forgotLoading"
                >
                  重置密码
                </el-button>
                <el-button
                  size="large"
                  class="form-button secondary-button"
                  @click="showLoginForm"
                >
                  返回登录
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const loginFormRef = ref()
const forgotFormRef = ref()
const loading = ref(false)
const forgotLoading = ref(false)
const showForgotPassword = ref(false)

const loginForm = ref({
  account: '',
  password: '',
  captcha: '',
  remember: false
})

const forgotForm = ref({
  account: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

// 确认密码验证器
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== forgotForm.value.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const formRules = {
  account: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度应在4-20个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 20, message: '密码长度应在4-20个字符之间', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为4位', trigger: 'blur' }
  ]
}

// 忘记密码表单验证规则
const forgotFormRules = {
  account: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度应在4-20个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 4, max: 20, message: '密码长度应在4-20个字符之间', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为4位', trigger: 'blur' }
  ]
}

const captchaText = ref('')
const correctCaptcha = ref('')
const captchaCanvas = ref(null)

// 验证码配置
const captchaConfig = {
  width: 100,
  height: 46,
  fontSize: 26, // 增大字体大小
  chars: 'ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstuvwxyz23456789', // 排除容易混淆的字符
  length: 4,
  noise: 20, // 噪点数量
  lines: 3,  // 干扰线数量
  colors: [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f',
    '#e74c3c', '#34495e', '#16a085', '#27ae60', '#2980b9'
  ]
}

// 动态验证码背景样式
const captchaStyle = computed(() => {
  return {
    background: '#f5f7fa',
    border: '1px solid #dcdfe6',
    overflow: 'hidden',
    position: 'relative'
  }
})

// 生成随机颜色
const getRandomColor = () => {
  return captchaConfig.colors[Math.floor(Math.random() * captchaConfig.colors.length)]
}

// 生成随机验证码
const generateCaptcha = () => {
  const { chars, length } = captchaConfig
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
  correctCaptcha.value = result
  
  // 在下一个渲染周期绘制验证码
  setTimeout(() => {
    drawCaptcha()
  }, 50)
}

// 绘制验证码到Canvas
const drawCaptcha = () => {
  if (!captchaCanvas.value) return
  
  const canvas = captchaCanvas.value
  const ctx = canvas.getContext('2d')
  const { width, height, fontSize, noise, lines } = captchaConfig
  
  // 设置canvas尺寸
  canvas.width = width
  canvas.height = height
  
  // 清空画布并填充背景
  ctx.fillStyle = '#f5f7fa'
  ctx.fillRect(0, 0, width, height)
  
  // 绘制干扰线
  for (let i = 0; i < lines; i++) {
    ctx.strokeStyle = getRandomColor()
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.bezierCurveTo(
      Math.random() * width, Math.random() * height,
      Math.random() * width, Math.random() * height,
      Math.random() * width, Math.random() * height
    )
    ctx.stroke()
  }
  
  // 绘制噪点
  for (let i = 0; i < noise; i++) {
    ctx.fillStyle = getRandomColor()
    ctx.beginPath()
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  
  // 绘制文字
  const text = captchaText.value
  const charWidth = width / (text.length + 2) // 字符间距
  
  ctx.textBaseline = 'middle'
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const x = charWidth * (i + 1)
    const y = height / 2 + Math.random() * 6 - 3 // 垂直位置随机偏移
    
    // 随机字体大小
    const charSize = fontSize + Math.random() * 4 - 2
    ctx.font = `bold ${charSize}px Arial`
    
    // 随机旋转
    const rotation = Math.random() * 0.4 - 0.2 // -0.2 到 0.2 弧度
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    
    // 绘制文字阴影
    ctx.shadowBlur = 2
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    
    // 绘制文字
    ctx.fillStyle = getRandomColor()
    ctx.fillText(char, 0, 0)
    
    ctx.restore()
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  generateCaptcha()
}

// 显示忘记密码表单
const showForgotPasswordForm = () => {
  showForgotPassword.value = true
  // 清空忘记密码表单
  forgotForm.value = {
    account: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  }
  // 刷新验证码
  refreshCaptcha()
}

// 显示登录表单
const showLoginForm = () => {
  showForgotPassword.value = false
  // 清空登录表单验证码
  loginForm.value.captcha = ''
  // 刷新验证码
  refreshCaptcha()
}

// 登录处理
const handleLogin = async () => {
  try {
    // 先进行表单验证
    await loginFormRef.value.validate()
    
    // 验证验证码
    if (loginForm.value.captcha.toLowerCase() !== correctCaptcha.value.toLowerCase()) {
      ElMessage.error('验证码错误，请重新输入')
      refreshCaptcha()
      loginForm.value.captcha = ''
      return
    }
    
    loading.value = true
    
    // 调用后端登录接口
    const response = await request.post('/user/login', {
      account: loginForm.value.account,
      password: loginForm.value.password
    })
    
    // 登录成功
    ElMessage.success(response.msg || '登录成功')
    
    // 存储token和用户信息 - 使用Authorization作为token名称与后端保持一致
    const { token, username, id, email } = response.data
    localStorage.setItem('Authorization', token)
    localStorage.setItem('userId', id)
    localStorage.setItem('username', username)
    localStorage.setItem('email', email)
    
    // 如果选择了记住密码，则保存账号密码
    if (loginForm.value.remember) {
      localStorage.setItem('account', loginForm.value.account)
      localStorage.setItem('password', loginForm.value.password)
    } else {
      localStorage.removeItem('account')
      localStorage.removeItem('password')
    }
    
    // 跳转到首页
    router.push('/dashboard')
  } catch (error) {
    console.error('登录请求错误:', error)
    refreshCaptcha()
    ElMessage.error(error.message || '请检查输入信息')
  } finally {
    loading.value = false
  }
}

// 忘记密码处理
const handleForgotPassword = async () => {
  try {
    // 验证表单
    await forgotFormRef.value.validate()
    
    // 验证验证码
    if (forgotForm.value.captcha.toLowerCase() !== correctCaptcha.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      return
    }
    
    forgotLoading.value = true
    
    // 获取用户信息（现在后端API已经返回id字段）
    const userResponse = await request.get(`/user/${forgotForm.value.account}`)
    if (!userResponse.data) {
      ElMessage.error('用户不存在')
      return
    }
    
    const userId = userResponse.data.id
    
    // 调用后端修改用户信息接口重置密码
    await request.put('/user/update', {
      id: userId,
      password: forgotForm.value.password
    })
    
    // 重置密码成功
    ElMessage.success('密码重置成功，请使用新密码登录')
    
    // 清空表单并返回登录页面
    forgotForm.value = {
      account: '',
      password: '',
      confirmPassword: '',
      captcha: ''
    }
    showLoginForm()
    
  } catch (error) {
    console.error('重置密码失败:', error)
    refreshCaptcha()
    ElMessage.error(error.response?.data?.msg || '重置密码失败，请检查输入信息')
  } finally {
    forgotLoading.value = false
  }
}

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha()
  
  // 如果有保存的账号密码，则自动填充
  const savedAccount = localStorage.getItem('account')
  const savedPassword = localStorage.getItem('password')
  
  if (savedAccount && savedPassword) {
    loginForm.value.account = savedAccount
    loginForm.value.password = savedPassword
    loginForm.value.remember = true
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: url('../assets/login-bg.png') center/cover no-repeat;
  position: relative;
}

.login-left {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 100vh;
}

.system-title {
  color: white;
  text-align: center;
  padding: 2rem;
}

.system-title h1 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.system-title h2 {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 300;
  margin: 0;
}

.login-right {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 100vh;
}

.login-form-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
}

.welcome-title {
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
  text-align: left;
}

.welcome-subtitle {
  color: #606266;
  margin-bottom: 2rem;
  text-align: left;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-right {
    padding: 1.5rem;
  }
  
  .login-form-container {
    max-width: 350px;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    width: 100%;
    min-height: 30vh;
    padding: 1rem;
  }
  
  .login-right {
    width: 100%;
    min-height: 70vh;
    padding: 1rem;
  }
  
  .login-form-container {
    max-width: 100%;
    padding: 1.5rem;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.8);
  }
  
  .welcome-title {
    margin-bottom: 0.5rem;
  }
  
  .welcome-subtitle {
    margin-bottom: 1.5rem;
  }
}

.login-form {
  width: 100%;
}

.login-form .el-form-item {
  margin-bottom: clamp(16px, 3vw, 20px);
}

.login-form .el-input__wrapper {
  padding: clamp(10px, 2vw, 12px) clamp(12px, 3vw, 15px);
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-form .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #cbd5e0 inset !important;
  transform: translateY(-1px);
}

.login-form .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 2px #4299e1 inset !important;
  transform: translateY(-1px);
}

.login-form .el-input {
  font-size: clamp(14px, 2vw, 16px);
}

/* 响应式表单 */
@media (max-width: 480px) {
  .login-form .el-form-item {
    margin-bottom: 16px;
  }
  
  .login-form .el-input__wrapper {
    padding: 10px 12px;
  }
}

.login-form .el-button {
  border-radius: 8px;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
}

/* 统一按钮样式 */
.form-button {
  width: 100% !important;
  height: 46px !important;
  border-radius: 8px !important;
  font-size: clamp(14px, 2vw, 16px) !important;
  font-weight: 500 !important;
  border: none !important;
  transition: all 0.3s ease !important;
  box-sizing: border-box !important;
}

.primary-button {
  background: #409eff !important;
  color: white !important;
}

.primary-button:hover {
  background: #66b1ff !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3) !important;
}

.secondary-button {
  background: #f5f7fa !important;
  color: #606266 !important;
  border: 1px solid #dcdfe6 !important;
}

.secondary-button:hover {
  background: #ecf5ff !important;
  color: #409eff !important;
  border-color: #409eff !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15) !important;
}

/* 响应式按钮 */
@media (max-width: 480px) {
  .form-button {
    height: 42px !important;
    font-size: 14px !important;
  }
  
  .primary-button {
    margin-bottom: 10px !important;
  }
}

.captcha-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.captcha-image {
  width: clamp(80px, 20vw, 100px);
  height: clamp(38px, 10vw, 46px);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.captcha-image canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.captcha-image:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式验证码 */
@media (max-width: 480px) {
  .captcha-container {
    gap: 8px;
  }
  
  .captcha-image {
    width: 80px;
    height: 38px;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  text-align: right;
}

/* 忘记密码页面按钮容器 */
.forgot-password-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.forgot-password-buttons .form-button {
  width: 100% !important;
  margin-left: 0;
}

/* 响应式忘记密码按钮 */
@media (max-width: 480px) {
  .forgot-password-buttons {
    gap: 10px;
  }
}
</style>