<template>
  <div class="layout">
    <el-container style="height: 100vh">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="sidebar">
        <div class="sidebar-header">
          <span class="sidebar-logo">🍽️</span>
          <span class="sidebar-title">家庭点单</span>
        </div>
        <el-menu
          :default-active="route.path"
          router
          background-color="#1d1e1f"
          text-color="#a0a4a8"
          active-text-color="#FF6B35"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/dishes">
            <el-icon><ColdDrink /></el-icon>
            <span>菜品管理</span>
          </el-menu-item>
          <el-menu-item index="/categories">
            <el-icon><FolderOpened /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/members">
            <el-icon><User /></el-icon>
            <span>成员管理</span>
          </el-menu-item>
        </el-menu>
        <div class="sidebar-footer">
          <el-tag type="warning" size="small">{{ member?.role === 'admin' ? '管理员' : member?.role === 'chef' ? '大厨' : '成员' }}</el-tag>
          <span class="sidebar-user">{{ member?.nickname }}</span>
          <el-button text size="small" @click="logout" style="color:#a0a4a8">退出</el-button>
        </div>
      </el-aside>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const member = JSON.parse(localStorage.getItem('member') || '{}')

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('member')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  background: #1d1e1f;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #2a2b2c;
}
.sidebar-logo {
  font-size: 24px;
}
.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}
.sidebar-footer {
  margin-top: auto;
  padding: 16px 20px;
  border-top: 1px solid #2a2b2c;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #a0a4a8;
}
.sidebar-user {
  flex: 1;
}
.main-content {
  background: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}
:deep(.el-menu) {
  border-right: none;
}
</style>
