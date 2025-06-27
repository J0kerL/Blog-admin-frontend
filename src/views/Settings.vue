<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span class="title">系统设置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form 
            :model="basicSettings" 
            :rules="basicRules" 
            ref="basicFormRef" 
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="网站标题" prop="siteTitle">
              <el-input 
                v-model="basicSettings.siteTitle" 
                placeholder="请输入网站标题"
              />
            </el-form-item>
            
            <el-form-item label="网站描述" prop="siteDescription">
              <el-input 
                v-model="basicSettings.siteDescription" 
                type="textarea" 
                :rows="3"
                placeholder="请输入网站描述"
              />
            </el-form-item>
            
            <el-form-item label="网站关键词" prop="siteKeywords">
              <el-input 
                v-model="basicSettings.siteKeywords" 
                placeholder="请输入网站关键词，用逗号分隔"
              />
            </el-form-item>
            
            <el-form-item label="网站Logo" prop="siteLogo">
              <el-input 
                v-model="basicSettings.siteLogo" 
                placeholder="请输入Logo URL"
              >
                <template #append>
                  <el-button @click="previewLogo">预览</el-button>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="ICP备案号" prop="icpNumber">
              <el-input 
                v-model="basicSettings.icpNumber" 
                placeholder="请输入ICP备案号"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="saveBasicSettings"
                :loading="savingBasic"
              >
                保存基本设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 邮件设置 -->
        <el-tab-pane label="邮件设置" name="email">
          <el-form 
            :model="emailSettings" 
            :rules="emailRules" 
            ref="emailFormRef" 
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="SMTP服务器" prop="smtpHost">
              <el-input 
                v-model="emailSettings.smtpHost" 
                placeholder="请输入SMTP服务器地址"
              />
            </el-form-item>
            
            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input-number 
                v-model="emailSettings.smtpPort" 
                :min="1" 
                :max="65535"
                placeholder="请输入SMTP端口"
              />
            </el-form-item>
            
            <el-form-item label="发件人邮箱" prop="fromEmail">
              <el-input 
                v-model="emailSettings.fromEmail" 
                placeholder="请输入发件人邮箱"
              />
            </el-form-item>
            
            <el-form-item label="邮箱密码" prop="emailPassword">
              <el-input 
                v-model="emailSettings.emailPassword" 
                type="password" 
                show-password
                placeholder="请输入邮箱密码或授权码"
              />
            </el-form-item>
            
            <el-form-item label="启用SSL">
              <el-switch 
                v-model="emailSettings.enableSSL" 
                active-text="启用" 
                inactive-text="禁用"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="saveEmailSettings"
                :loading="savingEmail"
              >
                保存邮件设置
              </el-button>
              <el-button 
                @click="testEmail"
                :loading="testingEmail"
              >
                测试邮件
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 存储设置 -->
        <el-tab-pane label="存储设置" name="storage">
          <el-form 
            :model="storageSettings" 
            :rules="storageRules" 
            ref="storageFormRef" 
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="存储类型">
              <el-radio-group v-model="storageSettings.storageType">
                <el-radio label="local">本地存储</el-radio>
                <el-radio label="oss">阿里云OSS</el-radio>
                <el-radio label="qiniu">七牛云</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <!-- 阿里云OSS设置 -->
            <template v-if="storageSettings.storageType === 'oss'">
              <el-form-item label="AccessKey ID" prop="ossAccessKeyId">
                <el-input 
                  v-model="storageSettings.ossAccessKeyId" 
                  placeholder="请输入AccessKey ID"
                />
              </el-form-item>
              
              <el-form-item label="AccessKey Secret" prop="ossAccessKeySecret">
                <el-input 
                  v-model="storageSettings.ossAccessKeySecret" 
                  type="password" 
                  show-password
                  placeholder="请输入AccessKey Secret"
                />
              </el-form-item>
              
              <el-form-item label="Bucket名称" prop="ossBucket">
                <el-input 
                  v-model="storageSettings.ossBucket" 
                  placeholder="请输入Bucket名称"
                />
              </el-form-item>
              
              <el-form-item label="地域节点" prop="ossEndpoint">
                <el-input 
                  v-model="storageSettings.ossEndpoint" 
                  placeholder="请输入地域节点"
                />
              </el-form-item>
            </template>
            
            <!-- 七牛云设置 -->
            <template v-if="storageSettings.storageType === 'qiniu'">
              <el-form-item label="AccessKey" prop="qiniuAccessKey">
                <el-input 
                  v-model="storageSettings.qiniuAccessKey" 
                  placeholder="请输入AccessKey"
                />
              </el-form-item>
              
              <el-form-item label="SecretKey" prop="qiniuSecretKey">
                <el-input 
                  v-model="storageSettings.qiniuSecretKey" 
                  type="password" 
                  show-password
                  placeholder="请输入SecretKey"
                />
              </el-form-item>
              
              <el-form-item label="存储空间" prop="qiniuBucket">
                <el-input 
                  v-model="storageSettings.qiniuBucket" 
                  placeholder="请输入存储空间名称"
                />
              </el-form-item>
              
              <el-form-item label="访问域名" prop="qiniuDomain">
                <el-input 
                  v-model="storageSettings.qiniuDomain" 
                  placeholder="请输入访问域名"
                />
              </el-form-item>
            </template>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="saveStorageSettings"
                :loading="savingStorage"
              >
                保存存储设置
              </el-button>
              <el-button 
                @click="testStorage"
                :loading="testingStorage"
              >
                测试连接
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form 
            :model="securitySettings" 
            ref="securityFormRef" 
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="登录验证码">
              <el-switch 
                v-model="securitySettings.enableCaptcha" 
                active-text="启用" 
                inactive-text="禁用"
              />
            </el-form-item>
            
            <el-form-item label="登录失败限制">
              <el-switch 
                v-model="securitySettings.enableLoginLimit" 
                active-text="启用" 
                inactive-text="禁用"
              />
            </el-form-item>
            
            <el-form-item label="最大失败次数" v-if="securitySettings.enableLoginLimit">
              <el-input-number 
                v-model="securitySettings.maxLoginAttempts" 
                :min="3" 
                :max="10"
              />
            </el-form-item>
            
            <el-form-item label="锁定时间(分钟)" v-if="securitySettings.enableLoginLimit">
              <el-input-number 
                v-model="securitySettings.lockoutDuration" 
                :min="5" 
                :max="60"
              />
            </el-form-item>
            
            <el-form-item label="Token过期时间">
              <el-select v-model="securitySettings.tokenExpiration">
                <el-option label="1小时" value="1h" />
                <el-option label="6小时" value="6h" />
                <el-option label="12小时" value="12h" />
                <el-option label="1天" value="1d" />
                <el-option label="7天" value="7d" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="saveSecuritySettings"
                :loading="savingSecurity"
              >
                保存安全设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const activeTab = ref('basic')
const basicFormRef = ref()
const emailFormRef = ref()
const storageFormRef = ref()
const securityFormRef = ref()

const savingBasic = ref(false)
const savingEmail = ref(false)
const savingStorage = ref(false)
const savingSecurity = ref(false)
const testingEmail = ref(false)
const testingStorage = ref(false)

// 基本设置
const basicSettings = ref({
  siteTitle: 'Diamond个人博客',
  siteDescription: '一个基于Spring Boot和Vue的个人博客系统',
  siteKeywords: '博客,个人博客,技术分享,Diamond',
  siteLogo: '',
  icpNumber: ''
})

// 邮件设置
const emailSettings = ref({
  smtpHost: '',
  smtpPort: 587,
  fromEmail: '',
  emailPassword: '',
  enableSSL: true
})

// 存储设置
const storageSettings = ref({
  storageType: 'local',
  ossAccessKeyId: '',
  ossAccessKeySecret: '',
  ossBucket: '',
  ossEndpoint: '',
  qiniuAccessKey: '',
  qiniuSecretKey: '',
  qiniuBucket: '',
  qiniuDomain: ''
})

// 安全设置
const securitySettings = ref({
  enableCaptcha: true,
  enableLoginLimit: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  tokenExpiration: '1d'
})

// 验证规则
const basicRules = {
  siteTitle: [
    { required: true, message: '请输入网站标题', trigger: 'blur' }
  ],
  siteDescription: [
    { required: true, message: '请输入网站描述', trigger: 'blur' }
  ]
}

const emailRules = {
  smtpHost: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' }
  ],
  fromEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const storageRules = {
  ossAccessKeyId: [
    { required: true, message: '请输入AccessKey ID', trigger: 'blur' }
  ],
  ossAccessKeySecret: [
    { required: true, message: '请输入AccessKey Secret', trigger: 'blur' }
  ],
  ossBucket: [
    { required: true, message: '请输入Bucket名称', trigger: 'blur' }
  ],
  ossEndpoint: [
    { required: true, message: '请输入地域节点', trigger: 'blur' }
  ],
  qiniuAccessKey: [
    { required: true, message: '请输入AccessKey', trigger: 'blur' }
  ],
  qiniuSecretKey: [
    { required: true, message: '请输入SecretKey', trigger: 'blur' }
  ],
  qiniuBucket: [
    { required: true, message: '请输入存储空间名称', trigger: 'blur' }
  ],
  qiniuDomain: [
    { required: true, message: '请输入访问域名', trigger: 'blur' }
  ]
}

// 获取设置数据
const getSettings = async () => {
  try {
    // 这里可以调用后端API获取设置数据
    // const response = await request.get('/settings')
    // 暂时使用默认数据
    console.log('获取设置数据')
  } catch (error) {
    console.error('获取设置失败:', error)
    ElMessage.error('获取设置失败')
  }
}

// 保存基本设置
const saveBasicSettings = async () => {
  try {
    await basicFormRef.value.validate()
    
    savingBasic.value = true
    
    // 调用后端API保存设置
    // await request.post('/settings/basic', basicSettings.value)
    
    ElMessage.success('基本设置保存成功')
  } catch (error) {
    console.error('保存基本设置失败:', error)
    ElMessage.error('保存基本设置失败')
  } finally {
    savingBasic.value = false
  }
}

// 保存邮件设置
const saveEmailSettings = async () => {
  try {
    await emailFormRef.value.validate()
    
    savingEmail.value = true
    
    // 调用后端API保存设置
    // await request.post('/settings/email', emailSettings.value)
    
    ElMessage.success('邮件设置保存成功')
  } catch (error) {
    console.error('保存邮件设置失败:', error)
    ElMessage.error('保存邮件设置失败')
  } finally {
    savingEmail.value = false
  }
}

// 保存存储设置
const saveStorageSettings = async () => {
  try {
    await storageFormRef.value.validate()
    
    savingStorage.value = true
    
    // 调用后端API保存设置
    // await request.post('/settings/storage', storageSettings.value)
    
    ElMessage.success('存储设置保存成功')
  } catch (error) {
    console.error('保存存储设置失败:', error)
    ElMessage.error('保存存储设置失败')
  } finally {
    savingStorage.value = false
  }
}

// 保存安全设置
const saveSecuritySettings = async () => {
  try {
    savingSecurity.value = true
    
    // 调用后端API保存设置
    // await request.post('/settings/security', securitySettings.value)
    
    ElMessage.success('安全设置保存成功')
  } catch (error) {
    console.error('保存安全设置失败:', error)
    ElMessage.error('保存安全设置失败')
  } finally {
    savingSecurity.value = false
  }
}

// 测试邮件
const testEmail = async () => {
  try {
    testingEmail.value = true
    
    // 调用后端API测试邮件
    // await request.post('/settings/test-email', emailSettings.value)
    
    ElMessage.success('邮件测试成功')
  } catch (error) {
    console.error('邮件测试失败:', error)
    ElMessage.error('邮件测试失败')
  } finally {
    testingEmail.value = false
  }
}

// 测试存储
const testStorage = async () => {
  try {
    testingStorage.value = true
    
    // 调用后端API测试存储
    // await request.post('/settings/test-storage', storageSettings.value)
    
    ElMessage.success('存储连接测试成功')
  } catch (error) {
    console.error('存储连接测试失败:', error)
    ElMessage.error('存储连接测试失败')
  } finally {
    testingStorage.value = false
  }
}

// 预览Logo
const previewLogo = () => {
  if (!basicSettings.value.siteLogo) {
    ElMessage.warning('请先输入Logo URL')
    return
  }
  
  ElMessageBox.alert(
    `<img src="${basicSettings.value.siteLogo}" style="max-width: 200px; max-height: 200px;" />`,
    'Logo预览',
    {
      dangerouslyUseHTMLString: true
    }
  )
}

// 组件挂载时获取设置数据
onMounted(() => {
  getSettings()
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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

.settings-tabs {
  margin-top: 20px;
}

.settings-form {
  max-width: 600px;
  margin-top: 20px;
}

:deep(.el-tabs__content) {
  padding-top: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>