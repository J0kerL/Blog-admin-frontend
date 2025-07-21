<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="queryParams.sex" placeholder="请选择性别" clearable>
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
            <el-option label="保密" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
        :data="userList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection"  width="55" align="center" />
        <el-table-column label="头像"  prop="avatar" align="center">
          <template #default="{ row }">
            <el-image :src="row.avatar" style="width: 40px; height: 40px; border-radius: 5px;" />
          </template>
        </el-table-column>
        <el-table-column label="用户名" align="center" prop="username" show-overflow-tooltip />
        <el-table-column label="邮箱" align="center" prop="email" show-overflow-tooltip />
        <el-table-column label="性别" align="center" prop="sex">
          <template #default="{ row }">
            <el-tag :type="row.sex === 1 ? 'primary' : row.sex === 2 ? 'success' : 'info'">
              {{ row.sex === 1 ? '男' : row.sex === 2 ? '女' : '保密' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" align="center" prop="roleId" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.roleId)">
              {{ getRoleName(row.roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              type="info"
              link
              icon="Key"
              @click="handleResetPwd(scope.row)"
            >重置密码</el-button>
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

    <!-- 添加或修改用户对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      append-to-body
      destroy-on-close
      class="custom-dialog"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
        class="custom-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="userForm.username" 
                placeholder="请输入用户名" 
                :disabled="dialog.type === 'edit'"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="userForm.email" 
                placeholder="请输入邮箱"
                clearable 
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="userForm.sex">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
                <el-radio :value="0">保密</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password" v-if="dialog.type === 'add'">
              <el-input 
                v-model="userForm.password" 
                type="password" 
                placeholder="请输入密码"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="角色" prop="roleId">
          <el-select
            v-model="userForm.roleId"
            placeholder="请选择角色"
            style="width: 100%"
            :disabled="userForm.username === 'admin'"
            clearable
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="userForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加重置密码弹窗 -->
    <el-dialog
      title="重置密码"
      v-model="resetPwdDialog.visible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="resetPwdFormRef"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="resetPwdForm.password"
            placeholder="请输入新密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPwdForm.confirmPassword"
            placeholder="请再次输入新密码"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPwdDialog.visible = false">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitResetPwd">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserList, addUser, updateUser, deleteUser, resetUserPwd, getRoleOptions } from '@/api/system/user'
import ButtonGroup from '@/components/ButtonGroup/index.vue'

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  username: '',
  status: '',
  sex: ''
})

// 登录方式选项
const loginTypes = [
  { value: 'USERNAME', label: '用户名', style: 'primary' },
  { value: 'EMAIL', label: '邮箱', style: 'success' },
  { value: 'MOBILE', label: '手机号', style: 'warning' },
  { value: 'WECHAT', label: '微信', style: 'info' }
]

// 表格数据
const userList = ref([])
const total = ref(0)
const loading = ref(false)
const selectedIds = ref<number[]>([])

// 角色选项
const roleOptions = ref([])

// 弹窗控制
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add'
})

// 用户表单
const userFormRef = ref<FormInstance>()
const userForm = reactive({
  id: undefined,
  username: '',
  password: '',
  email: '',
  sex: 1,
  status: 1,
  roleId: undefined
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// 重置密码表单
const resetPwdFormRef = ref<FormInstance>()
const resetPwdForm = reactive({
  userId: undefined,
  password: '',
  confirmPassword: ''
})

// 重置密码验证规则
const resetPwdRules = reactive<FormRules>({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPwdForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 重置密码弹窗控制
const resetPwdDialog = reactive({
  visible: false
})

// 提交状态
const submitLoading = ref(false)

// 查询用户列表
const getList = async () => {
  loading.value = true
  try {
    const { data } = await getUserList(queryParams)
    userList.value = data.records
    total.value = data.total
  } catch (error) {
    console.error('获取用户列表失败', error)
  } finally {
    loading.value = false
  }
}

// 获取角色选项
const getRoles = async () => {
  try {
    // 使用固定的角色选项，因为后端getRoleOptions返回的是临时数据
    roleOptions.value = [
      { id: 1, name: '超级管理员' },
      { id: 2, name: '管理员' },
      { id: 3, name: '普通用户' }
    ]
  } catch (error) {
    console.error('获取角色列表失败', error)
  }
}

// 获取角色名称
const getRoleName = (roleId: number) => {
  const roleMap = {
    1: '超级管理员',
    2: '管理员',
    3: '普通用户'
  }
  return roleMap[roleId as keyof typeof roleMap] || '未知角色'
}

// 获取角色标签类型
const getRoleTagType = (roleId: number) => {
  const typeMap = {
    1: 'danger',   // 超级管理员 - 红色
    2: 'warning',  // 管理员 - 橙色
    3: 'primary'   // 普通用户 - 蓝色
  }
  return typeMap[roleId as keyof typeof typeMap] || 'info'
}

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
  queryParams.username = ''
  queryParams.status = ''
  queryParams.sex = ''
  handleQuery()
}

// 新增按钮操作
const handleAdd = () => {
  resetForm()
  dialog.type = 'add'
  dialog.title = '添加用户'
  dialog.visible = true
}

// 修改按钮操作
const handleUpdate = (row: any) => {
  resetForm()
  dialog.type = 'edit'
  dialog.title = '修改用户'
  dialog.visible = true
  
  // 填充表单数据
  const { password, ...userData } = row
  Object.assign(userForm, userData)
}

// 重置密码按钮操作
const handleResetPwd = (row: any) => {
  resetPwdForm.userId = row.id
  resetPwdForm.password = ''
  resetPwdForm.confirmPassword = ''
  resetPwdDialog.visible = true
}

// 提交重置密码
const submitResetPwd = async () => {
  if (!resetPwdFormRef.value) return
  
  await resetPwdFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 使用更新用户接口来重置密码
        await updateUser({
          id: resetPwdForm.userId,
          password: resetPwdForm.password
        })
        ElMessage.success('密码重置成功')
        resetPwdDialog.visible = false
      } catch (error) {
        console.error('密码重置失败', error)
        ElMessage.error('密码重置失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 删除按钮操作
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户"${row.username}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

// 批量删除按钮操作
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的${selectedIds.value.length}条记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await Promise.all(selectedIds.value.map(id => deleteUser(id)))
      ElMessage.success('批量删除成功')
      getList()
    } catch (error) {
      console.error('批量删除失败', error)
    }
  }).catch(() => {})
}

// 表单提交
const submitForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialog.type === 'add') {
          // 新增用户时发送完整的AddUserDTO数据
          const addUserData = {
            username: userForm.username,
            password: userForm.password,
            email: userForm.email,
            sex: userForm.sex,
            status: userForm.status,
            roleId: userForm.roleId
          }
          await addUser(addUserData)
          ElMessage.success('新增成功')
        } else {
          // 修改用户时发送完整的UserDTO数据
          await updateUser(userForm)
          ElMessage.success('修改成功')
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
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  userForm.id = undefined
  userForm.username = ''
  userForm.password = ''
  userForm.email = ''
  userForm.sex = 1
  userForm.status = 1
  userForm.roleId = undefined
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
  getRoles()
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

.custom-dialog :deep(.el-form-item__content) {
  width: 100%;
}

.custom-form :deep(.el-select) {
  width: 100%;
}
</style> 