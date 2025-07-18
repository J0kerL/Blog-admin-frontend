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
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="已发布" :value="1" />
            <el-option label="草稿" :value="0" />
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
        <el-table-column label="标题" align="center" prop="title" width="200" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: var(--el-color-primary);">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作者" align="center" prop="nickname" show-overflow-tooltip />
        <el-table-column label="分类" align="center" prop="categoryName" />
        <el-table-column label="发布状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="阅读量" align="center" prop="quantity" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize"
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

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
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

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  categoryId: '',
  status: ''
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
  categoryId: '',
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
  queryParams.pageNum = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  queryParams.title = ''
  queryParams.categoryId = ''
  queryParams.status = ''
  handleQuery()
}

// 获取文章列表
const getList = () => {
  loading.value = true
  
  // 模拟数据
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        title: 'Spring boot 获取今年所有的节假日',
        content: '根据时间查看是否是节假日以及获取今年所有的节假日时间',
        categoryId: 1,
        categoryName: '后端开发',
        authorId: 2,
        nickname: 'Diamond',
        status: 1,
        quantity: 123,
        createTime: '2023-01-01 12:00:00'
      },
      {
        id: 2,
        title: 'int(1) 和 int(10) 的区别！',
        content: '很多资深开发竟然都不清楚 int(1) 和 int(10) 的区别！',
        categoryId: 3,
        categoryName: '数据库',
        authorId: 1,
        nickname: 'admin',
        status: 1,
        quantity: 456,
        createTime: '2023-01-02 13:00:00'
      }
    ]
    total.value = 2
    loading.value = false
  }, 500)
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
  Object.assign(form, row)
}

// 删除按钮操作
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除文章"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

// 批量删除按钮操作
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
    getList()
  }).catch(() => {})
}

// 表单提交
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        ElMessage.success('修改成功')
      } else {
        ElMessage.success('新增成功')
      }
      dialog.visible = false
      getList()
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
  form.categoryId = ''
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
  queryParams.pageNum = val
  getList()
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
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
</style> 