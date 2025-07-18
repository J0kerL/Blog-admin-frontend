<template>
  <div class="app-container">
    <!-- 操作按钮区域 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <ButtonGroup>
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
        :data="commentList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection"  width="55" align="center" />
        <el-table-column label="用户头像" align="center" prop="name" show-overflow-tooltip>
          <template #default="scope">
            <el-image :src="scope.row.avatar" style="width: 30px; height: 30px; border-radius: 50%;" />
          </template>
        </el-table-column>
        <el-table-column label="用户昵称" align="center" prop="nickname" show-overflow-tooltip />
        <el-table-column label="文章标题" align="center" prop="articleTitle" show-overflow-tooltip />
        <el-table-column label="评论内容" width="300" align="center" prop="content" show-overflow-tooltip>
          <template #default="scope">
            <span v-html="scope.row.content"></span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ButtonGroup from '@/components/ButtonGroup/index.vue'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

const loading = ref(false)
const total = ref(0)
const commentList = ref<any[]>([])

// 选中项数组
const selectedIds = ref<number[]>([])

// 获取评论列表
const getList = () => {
  loading.value = true
  
  // 模拟数据
  setTimeout(() => {
    commentList.value = [
      {
        id: 1,
        nickname: '张三',
        avatar: 'https://diamond-blog.oss-cn-beijing.aliyuncs.com/defaultAvatar.jpg',
        articleTitle: 'Spring boot 获取今年所有的节假日',
        content: '写得太好了，学习了！',
        createTime: '2023-01-01 12:00:00'
      },
      {
        id: 2,
        nickname: '李四',
        avatar: 'https://diamond-blog.oss-cn-beijing.aliyuncs.com/defaultAvatar.jpg',
        articleTitle: 'int(1) 和 int(10) 的区别！',
        content: '这个知识点很重要，感谢分享',
        createTime: '2023-01-02 13:00:00'
      }
    ]
    total.value = 2
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
  
  ElMessageBox.confirm(`是否确认删除 ${selectedIds.value.length} 个评论?`, '警告', {
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
  ElMessageBox.confirm(`是否确认删除 ${row.nickname} 的评论?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 页码改变
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style> 