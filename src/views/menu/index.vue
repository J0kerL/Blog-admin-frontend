<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="queryParams.title" placeholder="菜单名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
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
              @click="handleAdd(null)"
            >新增</el-button>
          </ButtonGroup>
        </div>
      </template>
      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column label="菜单名称" prop="title" show-overflow-tooltip />
        <el-table-column label="图标" align="center" width="60">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="路由地址" prop="path" show-overflow-tooltip />
        <el-table-column label="组件路径" prop="component" show-overflow-tooltip />
        <el-table-column label="排序" prop="sort" width="60" align="center" />
        <el-table-column label="状态" align="center" width="80">
          <template #default="{ row }">
            <el-tag :type="row.hidden === 0 ? 'success' : 'info'">
              {{ row.hidden === 0 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="success" link @click="handleAdd(row)">
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>修改
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增菜单' : '修改菜单'"
      width="700px"
      append-to-body
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                v-model="menuForm.parentId"
                :data="menuOptions"
                :props="{ label: 'title', value: 'id' }"
                value-key="id"
                placeholder="选择上级菜单"
                check-strictly
                :render-after-expand="false"
                class="flex-grow"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="菜单名称" prop="title">
              <el-input v-model="menuForm.title" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="menuForm.sort" :min="0" class="flex-grow" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="图标">
              <el-input v-model="menuForm.icon" placeholder="点击选择图标" readonly>
                <template #prefix>
                  <el-icon v-if="menuForm.icon">
                    <component :is="menuForm.icon" />
                  </el-icon>
                </template>
                <template #append>
                  <el-button @click="showIconSelect = true">
                    <el-icon><View /></el-icon>选择图标
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="路由地址" prop="path">
              <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="hidden">
              <el-radio-group v-model="menuForm.hidden">
                <el-radio :value="0">显示</el-radio>
                <el-radio :value="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图标选择器组件 -->
    <icon-select
      v-model="menuForm.icon"
      v-model:visible="showIconSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import IconSelect from '@/components/IconSelect/index.vue'
import ButtonGroup from '@/components/ButtonGroup/index.vue'
import {
  getMenuListApi,
  pageQueryMenuApi,
  createMenuApi,
  updateMenuApi,
  deleteMenuApi,
  getAllMenusApi
} from '@/api/system/menu'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const menuFormRef = ref<FormInstance>()
const showIconSelect = ref(false)
const submitLoading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  title: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { max: 20, message: '菜单名称长度不能超过20个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由地址', trigger: 'blur' },
    { max: 100, message: '路由地址长度不能超过100个字符', trigger: 'blur' }
  ],
  component: [
    { required: true, message: '请输入组件路径', trigger: 'blur' },
    { max: 100, message: '组件路径长度不能超过100个字符', trigger: 'blur' }
  ],
  icon: [
    { max: 30, message: '图标长度不能超过30个字符', trigger: 'blur' }
  ]
})

// 菜单表单对象
const menuForm = reactive({
  id: undefined,
  parentId: 0,
  title: '',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  hidden: 0
})

// 菜单数据
const menuList = ref<any[]>([])

// 菜单树选项
const menuOptions = ref<any[]>([])

// 查询方法
const getList = async () => {
  loading.value = true
  try {
    // 如果是查询列表，使用分页查询接口
    if (queryParams.title) {
      const { data } = await pageQueryMenuApi(queryParams)
      menuList.value = data.records || []
      total.value = data.total || 0
    } else {
      // 否则获取所有菜单（树形结构）
      const { data } = await getMenuListApi()
      menuList.value = data || []
      total.value = data.length || 0
    }
    
    // 获取所有菜单作为选项
    const { data: options } = await getAllMenusApi()
    menuOptions.value = [{ id: 0, title: '顶级菜单' }]
    if (options && options.length > 0) {
      menuOptions.value = menuOptions.value.concat(options)
    }
  } catch (error) {
    console.error('获取菜单列表失败', error)
  }
  loading.value = false
}

// 提交表单
const submitForm = async () => {
  if (!menuFormRef.value) return
  
  await menuFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const formData = { ...menuForm }
        
        if (dialogType.value === 'add') {
          await createMenuApi(formData)
          ElMessage.success('新增成功')
        } else {
          await updateMenuApi(formData)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        getList()
      } catch (error) {
        console.error('提交表单失败', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 删除菜单
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除菜单"${row.title}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteMenuApi(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除菜单失败', error)
    }
  }).catch(() => {})
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.title = ''
  handleQuery()
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.page = val
  getList()
}

// 重置表单
const resetForm = () => {
  menuForm.id = undefined
  menuForm.parentId = 0
  menuForm.title = ''
  menuForm.icon = ''
  menuForm.path = ''
  menuForm.component = ''
  menuForm.sort = 0
  menuForm.hidden = 0
}

// 新增菜单
const handleAdd = (row?: any) => {
  resetForm()
  if (row) {
    menuForm.parentId = row.id
  }
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 修改菜单
const handleEdit = (row: any) => {
  resetForm()
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(menuForm, row)
}

// 在组件挂载时获取数据
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

.flex-grow {
  width: 100%;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style> 