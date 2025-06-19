<template>
  <div class="login-container">
    <div class="login-left">
      <div class="system-title">
        <h1>Diamond个人博客后台管理系统</h1>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-container">
        <h1 class="welcome-title">欢迎回来</h1>
        <p class="welcome-subtitle">请输入您的账号和密码登录</p>
        
        <el-form :model="loginForm" :rules="formRules" ref="loginFormRef" class="login-form" @submit.prevent="handleLogin">
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
          
          <el-form-item prop="captcha">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                prefix-icon="Iphone"
                style="flex: 1; margin-right: 10px;"
              />
              <div class="captcha-image" @click="refreshCaptcha" :style="captchaStyle">
                <canvas ref="captchaCanvas"></canvas>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
              <el-link type="primary" class="forgot-password" :underline="false">忘记密码？</el-link>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              style="width: 100%;"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginFormRef = ref()

const loginForm = ref({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 4, max: 10, message: '用户名长度应在4-10个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 10, message: '密码长度应在4-10个字符之间', trigger: 'blur' },
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
    
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    ElMessage.error('请检查输入信息')
  }
}

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  background: url('../assets/login-bg.png') center/cover no-repeat;
}

.login-left {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.system-title {
  color: white;
  text-align: center;
}

.system-title h2 {
  font-size: 24px;
  font-weight: 300;
  margin: 0;
}

.login-right {
  width: 50%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 180px  250px;
}

.login-form-container {
  width: 100%;
  max-width: 380px;
  margin-top: 15px;
}

.welcome-title {
  font-size: 35px;
  font-weight: 600;
  color: black;
  margin-bottom: 5px;
  text-align: left;
}

.welcome-subtitle {
  color: #606266;
  margin-bottom: 26px;
  text-align: left;
  font-size: 14px;
}

.login-form {
  width: 100%;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-form .el-input__wrapper {
  padding: 12px 15px;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
}

.login-form .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #cbd5e0 inset !important;
}

.login-form .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px #4299e1 inset !important;
}

.login-form .el-button {
  border-radius: 8px;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
}

.captcha-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.captcha-image {
  width: 100px;
  height: 46px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  text-align: right;
}
</style>