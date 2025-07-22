<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入角色名称"
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
        :data="roleList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色名称" align="center" prop="name" show-overflow-tooltip />
        <el-table-column label="角色编码" align="center" prop="code" show-overflow-tooltip />
        <el-table-column label="备注" prop="remarks"  align="center" width="400" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="180" fixed="right">
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
          v-model:current-page="queryParams.page"
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

    <!-- 添加或修改角色对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="580px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="roleForm.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
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
import {
  getRoleListApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi
} from '@/api/system/role'
import ButtonGroup from '@/components/ButtonGroup/index.vue'

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: ''
})

const loading = ref(false)
const total = ref(0)
const roleList = ref([])
const queryFormRef = ref<FormInstance>()
const roleFormRef = ref<FormInstance>()
const submitLoading = ref(false)

// 弹窗控制
const dialog = reactive({
  title: '',
  visible: false
})

// 表单数据
const roleForm = reactive({
  id: undefined,
  name: '',
  code: '',
  sort: 0,
  status: 1,
  remarks: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '角色编码不能为空', trigger: 'blur' }
  ]
})

// 添加选中项数组
const selectedIds = ref<number[]>([])

// 表格选择项变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除处理
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    return
  }
  
  ElMessageBox.confirm('是否确认批量删除选中的角色?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await Promise.all(selectedIds.value.map(id => deleteRoleApi(id)))
      ElMessage.success('批量删除成功')
      getList()
    } catch (error) {
      console.error('批量删除失败', error)
    }
  }).catch(() => {})
}

// 查询角色列表
const getList = async () => {
  loading.value = true
  try {
    const { data } = await getRoleListApi(queryParams)
    roleList.value = data.records
    total.value = data.total
  } catch (error) {
    console.error('获取角色列表失败', error)
  } finally {
    loading.value = false
  }
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields()
  }
  handleQuery()
}

// 新增按钮操作
const handleAdd = () => {
  resetForm()
  dialog.title = '添加角色'
  dialog.visible = true
}

// 修改按钮操作
const handleUpdate = (row: any) => {
  resetForm()
  dialog.title = '修改角色'
  dialog.visible = true
  Object.assign(roleForm, row)
}

// 删除按钮操作
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`是否确认删除角色"${row.name}"?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRoleApi(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

// 表单提交
const submitForm = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (roleForm.id) {
          await updateRoleApi(roleForm)
          ElMessage.success('修改成功')
        } else {
          await createRoleApi(roleForm)
          ElMessage.success('新增成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('提交失败', error)
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
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
  roleForm.id = undefined
  roleForm.name = ''
  roleForm.code = ''
  roleForm.sort = 0
  roleForm.status = 1
  roleForm.remarks = ''
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