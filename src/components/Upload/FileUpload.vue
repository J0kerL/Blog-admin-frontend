<template>
  <div class="file-upload-container">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :http-request="customUpload"
      :list-type="listType"
      :headers="headers"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      :drag="drag"
      :show-file-list="showFileList"
    >
      <template v-if="listType === 'picture-card'">
        <el-icon><Plus /></el-icon>
      </template>
      <template v-else-if="drag">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </template>
      <template v-else>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          选择文件
        </el-button>
      </template>
      
      <template #tip>
        <div class="upload-tip">
          {{ getUploadTip() }}
        </div>
      </template>
    </el-upload>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="dialogVisible" :title="previewTitle" width="80%" top="5vh">
      <div class="preview-content">
        <!-- 图片预览 -->
        <img 
          v-if="isImageFile(dialogFileUrl)" 
          :src="dialogFileUrl" 
          alt="预览图片" 
          style="width: 100%; max-height: 500px; object-fit: contain;" 
        />
        <!-- 视频预览 -->
        <video 
          v-else-if="isVideoFile(dialogFileUrl)" 
          :src="dialogFileUrl" 
          controls 
          style="width: 100%; max-height: 500px;"
        >
          您的浏览器不支持视频播放
        </video>
        <!-- 音频预览 -->
        <audio 
          v-else-if="isAudioFile(dialogFileUrl)" 
          :src="dialogFileUrl" 
          controls 
          style="width: 100%;"
        >
          您的浏览器不支持音频播放
        </audio>
        <!-- 其他文件类型 -->
        <div v-else class="file-info">
          <el-icon size="64"><Document /></el-icon>
          <p>{{ dialogFileName }}</p>
          <el-button type="primary" @click="downloadFile(dialogFileUrl, dialogFileName)">
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled, Document } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { getToken } from '@/utils/auth'
import { uploadApi, batchUploadApi, deleteFileApi } from '@/api/file'

interface Props {
  modelValue: string | string[]
  // 文件类型：avatar-头像，image-图片，document-文档，video-视频，audio-音频
  fileType?: 'avatar' | 'image' | 'document' | 'video' | 'audio'
  // 上传限制数量
  limit?: number
  // 文件大小限制(MB)
  fileSize?: number
  // 是否支持多选
  multiple?: boolean
  // 显示类型
  listType?: 'text' | 'picture' | 'picture-card'
  // 是否支持拖拽上传
  drag?: boolean
  // 是否显示文件列表
  showFileList?: boolean
  // 自定义接受的文件类型
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  fileType: 'image',
  limit: 1,
  fileSize: 5,
  multiple: false,
  listType: 'picture-card',
  drag: false,
  showFileList: true,
  accept: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

// 上传地址 - 使用自定义上传方法
const uploadUrl = '#'

// 请求头
const headers = {
  Authorization: getToken()
}

// 计算接受的文件类型
const accept = computed(() => {
  if (props.accept) return props.accept
  
  const acceptMap = {
    'avatar': 'image/*',
    'image': 'image/*',
    'document': '.doc,.docx,.pdf,.txt,.zip,.rar,.xls,.xlsx,.ppt,.pptx',
    'video': 'video/*',
    'audio': 'audio/*'
  }
  
  return acceptMap[props.fileType] || '*'
})

const fileList = ref<UploadUserFile[]>([])
const dialogVisible = ref(false)
const dialogFileUrl = ref('')
const dialogFileName = ref('')
const previewTitle = ref('文件预览')

// 初始化文件列表
const initFileList = () => {
  if (!props.modelValue) {
    fileList.value = []
    return
  }
  
  if (typeof props.modelValue === 'string') {
    fileList.value = [{
      name: getFileName(props.modelValue),
      url: props.modelValue
    }]
  } else if (Array.isArray(props.modelValue)) {
    fileList.value = props.modelValue.map(url => ({
      name: getFileName(url),
      url: url
    }))
  }
}

// 从URL获取文件名
const getFileName = (url: string) => {
  return url.substring(url.lastIndexOf('/') + 1)
}

// 获取上传提示文本
const getUploadTip = () => {
  const typeMap = {
    'avatar': '头像图片(jpg, jpeg, png, gif, bmp, webp, svg)',
    'image': '图片文件(jpg, jpeg, png, gif, bmp, webp, svg)',
    'document': '文档文件(doc, docx, pdf, txt, zip, rar, xls, xlsx, ppt, pptx)',
    'video': '视频文件(mp4, avi, mov, wmv, flv, webm, mkv)',
    'audio': '音频文件(mp3, wav, flac, aac, ogg, m4a)'
  }
  
  const typeDesc = typeMap[props.fileType] || '文件'
  return `支持${typeDesc}，大小不超过${props.fileSize}MB`
}

// 文件类型验证
const validateFileType = (file: File) => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  const typeValidation = {
    'avatar': /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i,
    'image': /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i,
    'document': /\.(doc|docx|pdf|txt|zip|rar|xls|xlsx|ppt|pptx)$/i,
    'video': /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i,
    'audio': /\.(mp3|wav|flac|aac|ogg|m4a)$/i
  }
  
  const pattern = typeValidation[props.fileType]
  return pattern ? pattern.test(file.name) : false
}

// 判断是否为图片文件
const isImageFile = (url: string) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url)
}

// 判断是否为视频文件
const isVideoFile = (url: string) => {
  return /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(url)
}

// 判断是否为音频文件
const isAudioFile = (url: string) => {
  return /\.(mp3|wav|flac|aac|ogg|m4a)$/i.test(url)
}

// 上传前的校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 文件类型检查
  if (!validateFileType(file)) {
    ElMessage.error(`不支持的文件类型，请上传${getUploadTip()}`)
    return false
  }
  
  // 文件大小检查
  const isLtSize = file.size / 1024 / 1024 < props.fileSize
  if (!isLtSize) {
    ElMessage.error(`文件大小不能超过 ${props.fileSize}MB!`)
    return false
  }
  
  return true
}

// 自定义上传方法
const customUpload = async (options: any) => {
  try {
    const formData = new FormData()
    formData.append('file', options.file)
    
    const response = await uploadApi(formData, props.fileType)
    
    if (response.code === 200) {
      const url = response.data
      updateModelValue(url)
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(response.msg || '上传失败')
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error(error.response?.data?.msg || '上传失败，请重试')
  }
}

// 更新绑定值
const updateModelValue = (newUrl: string) => {
  if (props.multiple) {
    const urls = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    urls.push(newUrl)
    emit('update:modelValue', urls)
    
    fileList.value = urls.map(u => ({
      name: getFileName(u),
      url: u
    }))
  } else {
    emit('update:modelValue', newUrl)
    fileList.value = [{
      name: getFileName(newUrl),
      url: newUrl
    }]
  }
}

// 处理文件预览
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogFileUrl.value = uploadFile.url!
  dialogFileName.value = uploadFile.name
  previewTitle.value = `预览 - ${uploadFile.name}`
  dialogVisible.value = true
}

// 处理文件删除
const handleRemove: UploadProps['onRemove'] = async (uploadFile: any) => {
  try {
    // 调用删除接口
    await deleteFileApi(uploadFile.url)
    
    if (props.multiple) {
      const urls = Array.isArray(props.modelValue) ? props.modelValue.filter(url => url !== uploadFile.url) : []
      emit('update:modelValue', urls)
    } else {
      emit('update:modelValue', '')
    }
    
    ElMessage.success('文件删除成功')
  } catch (error) {
    console.error('删除文件失败:', error)
    ElMessage.error('删除文件失败')
  }
}

// 处理超出限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

// 下载文件
const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 监听modelValue变化
watch(() => props.modelValue, () => {
  initFileList()
}, { immediate: true })
</script>

<style scoped>
.file-upload-container {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  text-align: center;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.file-info p {
  margin: 0;
  font-size: 16px;
  color: #303133;
  word-break: break-all;
}

:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 100px;
}

:deep(.el-upload-list--picture-card) {
  --el-upload-list-picture-card-size: 100px;
}

:deep(.el-upload-dragger) {
  padding: 40px;
}

:deep(.el-upload-dragger .el-icon--upload) {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

:deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
}

:deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}
</style>