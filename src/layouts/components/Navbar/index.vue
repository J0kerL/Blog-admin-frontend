<template>
  <div class="navbar-container">
    <div class="navbar-left">
      <el-icon class="collapse-btn" @click="toggleCollapse">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>

      <Breadcrumb />
    </div>
    <div class="navbar-right">
      <!-- 全局搜索模块 -->
      <GlobalSearch />
      <!-- 用户信息 -->
      <user-tool />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/modules/settings'
import Breadcrumb from './Breadcrumb/index.vue'
import UserTool from './UserTool/index.vue'
import GlobalSearch from '@/components/GlobalSearch/index.vue'

const settingsStore = useSettingsStore()

defineProps({
  isCollapse: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle-collapse'])

const toggleCollapse = () => {
  emit('toggle-collapse')
}
</script>

<style lang="scss" scoped>
.navbar-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  
  .navbar-left {
    display: flex;
    align-items: center;

    
    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      margin-right: 16px;
      color: #606266;
      transition: all 0.3s;
      
      &:hover {
        color: v-bind('settingsStore.themeColor');
      }
    }
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    padding-right: 8px;
    position: absolute;
    right: 0;
    height: 100%;
  }
}
</style>
