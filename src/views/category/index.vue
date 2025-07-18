<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleQuery"
          />
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
            <el-button
              type="primary"
              icon="Plus"
              @click="handleAdd"
            >新增</el-button>
            <el-button
              type="danger"
              icon="Delete"
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
            >批量删除</el-button>
          </ButtonGroup>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection"  width="55" align="center" />
        <el-table-column label="名称" align="center" prop="name" show-overflow-tooltip />
        <el-table-column label="描述" align="center" prop="description" show-overflow-tooltip />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入名称" 
            clearable
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入描述" 
            clearable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
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
  name: ''
})

const loading = ref(false)
const total = ref(0)
const tableData = ref<any[]>([])
const queryFormRef = ref<FormInstance>()
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 选中项数组
const selectedIds = ref<number[]>([])

// 弹窗控制
const dialog = reactive({
  title: '',
  visible: false,
  type: 'add'
})

// 表单数据
const form = reactive({
  id: undefined,
  name: '',
  description: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
})

// 获取分类列表
const getList = () => {
  loading.value = true
  
  // 模拟数据
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        name: '后端开发',
        description: '记录后端开发相关技术',
        createTime: '2023-01-01 12:00:00'
      },
      {
        id: 2,
        name: '前端开发',
        description: '记录前端开发相关技术',
        createTime: '2023-01-01 12:00:00'
      },
      {
        id: 3,
        name: '数据库',
        description: '记录数据库相关技术',
        createTime: '2023-01-01 12:00:00'
      },
      {
        id: 4,
        name: '生活随笔',
        description: '记录生活中的美好',
        createTime: '2023-01-01 12:00:00'
      },
      {
        id: 5,
        name: '博客文章',
        description: '写在博客里的文章',
        createTime: '2023-01-01 12:00:00'
      }
    ]
    total.value = 5
    loading.value = false
  }, 500)
}

// 表格选择项变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return
  
  ElMessageBox.confirm(`是否确认删除 ${selectedIds.value.length} 个分类?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
    getList()
    selectedIds.value = []
  }).catch(() => {})
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`是否确认删除 ${row.name} 这个分类?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields()
  }
  queryParams.name = ''
  handleQuery()
}

// 新增分类
const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加分类'
  dialog.visible = true
  resetForm()
}

// 修改分类
const handleUpdate = (row: any) => {
  dialog.type = 'edit'
  dialog.title = '修改分类'
  dialog.visible = true
  resetForm()
  Object.assign(form, row)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        if (dialog.type === 'add') {
          // 模拟添加
          ElMessage.success('添加成功')
        } else {
          // 模拟修改
          ElMessage.success('修改成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('操作失败', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 取消按钮
const cancel = () => {
  dialog.visible = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.id = undefined
  form.name = ''
  form.description = ''
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