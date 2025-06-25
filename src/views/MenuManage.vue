<template>
  <div class="menu-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>菜单管理</h2>
      <p>管理系统菜单，包括菜单的增删改查操作</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="菜单标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入菜单标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="菜单名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入菜单名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增菜单
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 菜单表格 -->
    <div class="table-section">
      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="菜单标题" min-width="120" />
        <el-table-column prop="name" label="菜单名称" min-width="120" />
        <el-table-column prop="path" label="路由路径" min-width="150" />
        <el-table-column prop="component" label="前端组件" min-width="150" />
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="getIconComponent(row.icon)" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="isExternal" label="是否外链" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isExternal === 1 ? 'success' : 'info'">
              {{ row.isExternal === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="菜单标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单标题" />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="前端组件" prop="component">
          <el-input v-model="formData.component" placeholder="请输入前端组件名称" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-select v-model="formData.icon" placeholder="请选择菜单图标" clearable>
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <div style="display: flex; align-items: center;">
                <el-icon style="margin-right: 8px;">
                  <component :is="getIconComponent(icon.value)" />
                </el-icon>
                <span>{{ icon.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="是否外链">
          <el-radio-group v-model="formData.isExternal">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  User,
  Lock,
  Document,
  PriceTag,
  Collection,
  ChatLineRound,
  Setting,
  Odometer
} from '@element-plus/icons-vue'
import request from '../utils/request'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const selectedRows = ref([])
const formRef = ref(null)

// 搜索表单
const searchForm = reactive({
  title: '',
  name: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])

// 表单数据
const formData = reactive({
  id: null,
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  isExternal: 0
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入菜单标题', trigger: 'blur' },
    { max: 100, message: '菜单标题长度不能超过100个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' },
    { max: 255, message: '路由路径长度不能超过255个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
}

// 图标选项
const iconOptions = [
  { label: '用户', value: 'User' },
  { label: '锁定', value: 'Lock' },
  { label: '文档', value: 'Document' },
  { label: '标签', value: 'PriceTag' },
  { label: '收藏', value: 'Collection' },
  { label: '评论', value: 'ChatLineRound' },
  { label: '设置', value: 'Setting' },
  { label: '仪表盘', value: 'Odometer' }
]

// 图标映射
const iconMap = {
  'User': User,
  'Lock': Lock,
  'Document': Document,
  'PriceTag': PriceTag,
  'Collection': Collection,
  'ChatLineRound': ChatLineRound,
  'Setting': Setting,
  'Odometer': Odometer
}

// 获取图标组件
const getIconComponent = (iconName) => {
  return iconMap[iconName] || Document
}

// 获取菜单列表
const getMenuList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      title: searchForm.title || undefined,
      name: searchForm.name || undefined
    }
    
    const response = await request.get('/admin/menu/page', { params })
    if (response.code === 200) {
      tableData.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.msg || '获取菜单列表失败')
    }
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getMenuList()
}

// 重置
const handleReset = () => {
  searchForm.title = ''
  searchForm.name = ''
  pagination.page = 1
  getMenuList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增菜单'
  resetFormData()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑菜单'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜单"${row.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await request.delete(`/admin/menu/${row.id}`)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      getMenuList()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的菜单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedRows.value.length}个菜单吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedRows.value.map(row => row.id)
    const response = await request.delete('/admin/menu/batch', {
      data: ids
    })
    
    if (response.code === 200) {
      ElMessage.success('批量删除成功')
      getMenuList()
    } else {
      ElMessage.error(response.msg || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除菜单失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  getMenuList()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.page = page
  getMenuList()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const url = isEdit.value ? '/admin/menu' : '/admin/menu'
    const method = isEdit.value ? 'put' : 'post'
    
    const response = await request[method](url, formData)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      getMenuList()
    } else {
      ElMessage.error(response.msg || (isEdit.value ? '更新失败' : '新增失败'))
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
  resetFormData()
}

// 重置表单数据
const resetFormData = () => {
  formData.id = null
  formData.title = ''
  formData.name = ''
  formData.path = ''
  formData.component = ''
  formData.icon = ''
  formData.sort = 0
  formData.isExternal = 0
}

// 组件挂载时获取数据
onMounted(() => {
  getMenuList()
})
</script>

<style scoped>
.menu-manage {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #909399;
  font-size: 14px;
}

.search-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.search-form {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.table-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background-color: #f5f7fa;
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}
</style>