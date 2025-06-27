<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="title">个人中心</span>
        </div>
      </template>
      
      <div class="profile-content">
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar 
              :size="120" 
              :src="userInfo.avatar || defaultAvatar"
              @error="handleAvatarError"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-button 
              type="primary" 
              size="small" 
              class="upload-btn"
              @click="handleUploadAvatar"
            >
              更换头像
            </el-button>
          </div>
        </div>
        
        <div class="info-section">
          <el-form 
            :model="userInfo" 
            :rules="formRules" 
            ref="formRef" 
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="userInfo.username" 
                :disabled="!isEditing"
                placeholder="请输入用户名"
              />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="userInfo.email" 
                :disabled="!isEditing"
                placeholder="请输入邮箱"
              />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input 
                v-model="userInfo.phone" 
                :disabled="!isEditing"
                placeholder="请输入手机号"
              />
            </el-form-item>
            
            <el-form-item label="个人简介" prop="bio">
              <el-input 
                v-model="userInfo.bio" 
                type="textarea" 
                :rows="4"
                :disabled="!isEditing"
                placeholder="请输入个人简介"
              />
            </el-form-item>
            
            <el-form-item label="注册时间">
              <el-input 
                :value="formatDate(userInfo.createTime)" 
                disabled
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                v-if="!isEditing" 
                type="primary" 
                @click="startEdit"
              >
                编辑资料
              </el-button>
              <template v-else>
                <el-button 
                  type="primary" 
                  @click="saveProfile"
                  :loading="saving"
                >
                  保存
                </el-button>
                <el-button @click="cancelEdit">
                  取消
                </el-button>
              </template>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
    
    <!-- 修改密码卡片 -->
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span class="title">修改密码</span>
        </div>
      </template>
      
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordFormRef" 
        label-width="100px"
        class="password-form"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="changePassword"
            :loading="changingPassword"
          >
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import request from '../utils/request'

const formRef = ref()
const passwordFormRef = ref()
const isEditing = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const defaultAvatar = 'https://diamond-blog.oss-cn-beijing.aliyuncs.com/defaultAvatar.jpg'

const userInfo = ref({
  id: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  avatar: '',
  createTime: ''
})

const originalUserInfo = ref({})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 密码验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      ElMessage.error('用户信息不存在，请重新登录')
      return
    }
    
    const response = await request.get(`/user/${userId}`)
    userInfo.value = response.data
    originalUserInfo.value = { ...response.data }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
  originalUserInfo.value = { ...userInfo.value }
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  userInfo.value = { ...originalUserInfo.value }
}

// 保存用户信息
const saveProfile = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    const response = await request.put('/user/update', {
      id: userInfo.value.id,
      username: userInfo.value.username,
      email: userInfo.value.email,
      phone: userInfo.value.phone,
      bio: userInfo.value.bio,
      avatar: userInfo.value.avatar
    })
    
    ElMessage.success('保存成功')
    isEditing.value = false
    
    // 更新localStorage中的用户名
    localStorage.setItem('username', userInfo.value.username)
    
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.msg || '保存失败')
  } finally {
    saving.value = false
  }
}

// 修改密码
const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    
    changingPassword.value = true
    
    const response = await request.put('/user/changePassword', {
      id: userInfo.value.id,
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    ElMessage.success('密码修改成功')
    
    // 清空密码表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.msg || '修改密码失败')
  } finally {
    changingPassword.value = false
  }
}

// 处理头像上传
const handleUploadAvatar = () => {
  ElMessageBox.prompt('请输入头像URL', '更换头像', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^https?:\/\/.+/,
    inputErrorMessage: '请输入有效的URL地址'
  }).then(({ value }) => {
    userInfo.value.avatar = value
    if (isEditing.value) {
      // 如果正在编辑状态，不自动保存
      ElMessage.success('头像已更新，请点击保存按钮保存修改')
    } else {
      // 如果不在编辑状态，直接保存头像
      saveAvatar(value)
    }
  }).catch(() => {
    // 用户取消
  })
}

// 保存头像
const saveAvatar = async (avatarUrl) => {
  try {
    await request.put('/user/update', {
      id: userInfo.value.id,
      avatar: avatarUrl
    })
    
    ElMessage.success('头像更新成功')
  } catch (error) {
    console.error('头像更新失败:', error)
    ElMessage.error('头像更新失败')
    // 恢复原头像
    userInfo.value.avatar = originalUserInfo.value.avatar
  }
}

// 头像加载错误处理
const handleAvatarError = () => {
  userInfo.value.avatar = defaultAvatar
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card,
.password-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.profile-content {
  display: flex;
  gap: 40px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  margin-top: 10px;
}

.info-section {
  flex: 1;
}

.profile-form,
.password-form {
  max-width: 500px;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .avatar-container {
    align-self: center;
  }
}
</style>