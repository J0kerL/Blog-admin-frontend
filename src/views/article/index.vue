<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="标题" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入文章标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable>
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tagIds">
          <el-select v-model="queryParams.tagIds" placeholder="请选择标签" clearable multiple>
            <el-option v-for="item in tagOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <ButtonGroup>
            <el-button type="primary" icon="Plus" @click="handleAdd">新增文章</el-button>
            <el-button type="danger" icon="Delete" :disabled="selectedIds.length === 0"
              @click="handleBatchDelete">批量删除</el-button>
          </ButtonGroup>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="封面" align="center" width="150">
          <template #default="scope">
            <el-image
              v-if="scope.row.cover"
              :src="scope.row.cover"
              style="width: 120px; height: 80px; border-radius: 4px;"
              fit="contain"
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column label="标题" align="center" prop="title" width="200" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: var(--el-color-primary);">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作者" align="center" prop="authorName" show-overflow-tooltip />
        <el-table-column label="分类" align="center" prop="categoryName" />
        <el-table-column label="标签" align="center" prop="tags" width="200">
          <template #default="scope">
            <el-tag v-for="(tag, index) in scope.row.tags" :key="index" size="small" style="margin-right: 5px;"
              type="primary">
              {{ tag }}
            </el-tag>
            <span v-if="!scope.row.tags || scope.row.tags.length === 0" style="color: #999;">无标签</span>
          </template>
        </el-table-column>
        <el-table-column label="发布状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]" :total="total" :background="true"
          layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1000px" top="3vh" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="文章内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="10" placeholder="请输入文章内容" />
        </el-form-item>

        <el-form-item label="文章封面" prop="cover">
          <el-upload
            class="cover-uploader"
            :action="`${uploadUrl}/file/upload`"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            :headers="uploadHeaders"
          >
            <img v-if="form.cover" :src="form.cover" class="cover" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="tagIds">
          <el-select v-model="form.tagIds" placeholder="请选择标签" multiple collapse-tags collapse-tags-tooltip
            style="width: 100%" clearable>
            <el-option v-for="item in tagOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <div class="form-tip">可以选择多个标签，也可以不选择</div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="0">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import ButtonGroup from '@/components/ButtonGroup/index.vue'
import { getArticleListApi, addArticleApi, updateArticleApi, deleteArticleApi } from '@/api/article/index'
import { getAllTagsApi } from '@/api/tag/index'
import { getToken } from '@/utils/auth'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'

const uploadUrl = import.meta.env.VITE_APP_BASE_API
const uploadHeaders = reactive({
  Authorization: getToken() || ''
})

const handleCoverSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  if (response.code === 200) {
    form.cover = response.data
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error(response.msg || '封面上传失败')
  }
}

const beforeCoverUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isJpgOrPng = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('封面图片只支持 JPG/PNG 格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('封面图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  title: '',
  categoryId: '',
  tagIds: []
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const selectedIds = ref<number[]>([])

// 分类选项
const categoryOptions = ref([
  { id: 1, name: '后端开发' },
  { id: 2, name: '前端开发' },
  { id: 3, name: '数据库' },
  { id: 4, name: '生活随笔' },
  { id: 5, name: '博客文章' }
])

// 标签选项
const tagOptions = ref([])

// 弹窗控制
const dialog = reactive({
  visible: false,
  title: ''
})

// 表单对象
const formRef = ref<FormInstance>()
const form = reactive({
  id: undefined,
  title: '',
  content: '',
  cover: '',
  categoryId: '',
  tagIds: [],
  authorId: 1,
  status: 1
})

// 表单校验规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 150, message: '长度在 1 到 150 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ]
})

// 表格多选框选中数据
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  queryParams.title = ''
  queryParams.categoryId = ''
  queryParams.tagIds = []
  handleQuery()
}

// 获取文章列表
const getList = async () => {
  loading.value = true
  try {
    // 处理查询参数，避免发送空数组
    const params = { ...queryParams }
    if (!params.tagIds || params.tagIds.length === 0) {
      delete params.tagIds
    }
    if (!params.categoryId) {
      delete params.categoryId
    }
    // 注意：不要删除title参数，即使为空也要保留用于搜索

    // 特殊处理tagIds数组参数
    if (params.tagIds && params.tagIds.length > 0) {
      // 使用自定义请求来正确处理数组参数
      const searchParams = new URLSearchParams()
      searchParams.append('page', params.page.toString())
      searchParams.append('pageSize', params.pageSize.toString())

      if (params.title) {
        searchParams.append('title', params.title)
      }
      if (params.categoryId) {
        searchParams.append('categoryId', params.categoryId.toString())
      }

      // 为每个tagId添加单独的参数
      params.tagIds.forEach(tagId => {
        searchParams.append('tagIds', tagId.toString())
      })

      const response = await fetch(`${import.meta.env.VITE_APP_BASE_API}/article/page?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': getToken() || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.code === 200) {
        tableData.value = result.data.records || []
        total.value = result.data.total || 0
      } else {
        throw new Error(result.msg || '获取文章列表失败')
      }
    } else {
      // 没有标签筛选时也要正确处理标题搜索
      const searchParams = new URLSearchParams()
      searchParams.append('page', params.page.toString())
      searchParams.append('pageSize', params.pageSize.toString())

      if (params.title && params.title.trim() !== '') {
        searchParams.append('title', params.title.trim())
      }
      if (params.categoryId) {
        searchParams.append('categoryId', params.categoryId.toString())
      }

      const response = await fetch(`${import.meta.env.VITE_APP_BASE_API}/article/page?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': getToken() || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.code === 200) {
        tableData.value = result.data.records || []
        total.value = result.data.total || 0
      } else {
        throw new Error(result.msg || '获取文章列表失败')
      }
    }
  } catch (error) {
    console.error('获取文章列表失败', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 新增按钮操作
const handleAdd = () => {
  resetForm()
  dialog.title = '添加文章'
  dialog.visible = true
}

// 修改按钮操作
const handleUpdate = (row: any) => {
  resetForm()
  dialog.title = '修改文章'
  dialog.visible = true

  // 复制基础数据
  Object.assign(form, {
    id: row.id,
    title: row.title,
    content: row.content,
    cover: row.cover,
    categoryId: row.categoryId,
    status: row.status
  })

  // 处理标签数据：将标签名称数组转换为标签ID数组
  if (row.tags && row.tags.length > 0) {
    form.tagIds = row.tags.map(tagName => {
      const tag = tagOptions.value.find(option => option.name === tagName)
      return tag ? tag.id : null
    }).filter(id => id !== null)
  } else {
    form.tagIds = []
  }
}

// 删除按钮操作
const handleDelete = async (row: any) => {
  ElMessageBox.confirm(`确定删除文章"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteArticleApi(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除文章失败', error)
      ElMessage.error('删除文章失败')
    }
  }).catch(() => { })
}

// 批量删除按钮操作
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteArticleApi(selectedIds.value.join(','))
      ElMessage.success('批量删除成功')
      getList()
    } catch (error) {
      console.error('批量删除文章失败', error)
      ElMessage.error('批量删除文章失败')
    }
  }).catch(() => { })
}

// 表单提交
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await updateArticleApi(form)
          ElMessage.success('修改成功')
        } else {
          await addArticleApi(form)
          ElMessage.success('新增成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('提交文章失败', error)
        ElMessage.error('提交文章失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.id = undefined
  form.title = ''
  form.content = ''
  form.cover = ''
  form.categoryId = ''
  form.tagIds = []
  form.authorId = 1
  form.status = 1
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 分页页码改变
const handleCurrentChange = (val: number) => {
  queryParams.page = val
  getList()
}

// 获取标签选项
const getTagOptions = async () => {
  try {
    const { data } = await getAllTagsApi()
    tagOptions.value = data || []
  } catch (error) {
    console.error('获取标签列表失败', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
  getTagOptions()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-wrapper {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.cover-uploader .cover {
  width: 178px;
  height: 178px;
  display: block;
}

.cover-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>