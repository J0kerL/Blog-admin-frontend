<template>
  <div class="upload-container">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :http-request="customUpload"
      list-type="picture-card"
      :headers="headers"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="upload-tip">
          {{ getUploadTip() }}
        </div>
      </template>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="dialogVisible" top="5vh" title="预览图片">
      <img :src="dialogImageUrl" alt="Preview Image" style="width: 100%; height: 500px; object-fit: contain;" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { getToken } from '@/utils/auth'
import { uploadApi, deleteFileApi } from '@/api/file'

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: ''
  },
  limit: {
    type: Number,
    default: 1
  },
  fileSize: {
    type: Number,
    default: 5
  },
  multiple: {
    type: Boolean,
    default: false
  },
  // 文件类型：avatar-头像，image-图片，document-文档，video-视频，audio-音频
  fileType: {
    type: String,
    default: 'image'
  },
  // 支持的文件格式
  accept: {
    type: String,
    default: 'image/*'
  }
})

const emit = defineEmits(['update:modelValue'])

// 上传地址 - 使用自定义上传方法，不再使用action
const uploadUrl = '#'

// 请求头
const headers = {
  Authorization: getToken()
}

const fileList = ref<UploadUserFile[]>([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 初始化文件列表
const initFileList = () => {
  if (!props.modelValue) return
  
  if (typeof props.modelValue === 'string') {
    fileList.value = [{
      name: props.modelValue.substring(props.modelValue.lastIndexOf('/') + 1),
      url: props.modelValue
    }]
  } else if (Array.isArray(props.modelValue)) {
    fileList.value = (props.modelValue as string[]).map(url => ({
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url
    }))
  }
}

// 处理图片预览
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 处理图片删除
const handleRemove: UploadProps['onRemove'] = async (uploadFile: any) => {
  if (props.multiple) {
    await deleteFileApi(uploadFile.url)
    const urls = (props.modelValue as string[]).filter(url => url !== uploadFile.url)
    emit('update:modelValue', urls)
  } else {
    await deleteFileApi(uploadFile.url)
    emit('update:modelValue', '')
  }
}

// 自定义上传方法
const customUpload = async (options: any) => {
  try {
    const formData = new FormData()
    formData.append('file', options.file)
    
    const response = await uploadApi(formData, props.fileType)
    
    if (response.code === 200) {
      const url = response.data
      if (props.multiple) {
        const urls = props.modelValue ? [...(props.modelValue as string[])] : []
        urls.push(url)
        emit('update:modelValue', urls)
        fileList.value = urls.map(u => ({
          name: u.substring(u.lastIndexOf('/') + 1),
          url: u
        }))
      } else {
        emit('update:modelValue', url)
        fileList.value = [{
          name: url.substring(url.lastIndexOf('/') + 1),
          url: url
        }]
      }
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(response.msg || '上传失败')
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error(error.response?.data?.msg || '上传失败，请重试')
  }
}

// 处理超出限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
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
  
  const typeDesc = typeMap[props.fileType as keyof typeof typeMap] || '文件'
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
  
  const pattern = typeValidation[props.fileType as keyof typeof typeValidation]
  return pattern ? pattern.test(file.name) : false
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

// 监听modelValue变化
watch(() => props.modelValue, () => {
  initFileList()
}, { immediate: true })
</script>

<style scoped>
.upload-container {
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}

:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 100px;
}

:deep(.el-upload-list--picture-card) {
  --el-upload-list-picture-card-size: 100px;
}
</style> 