<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-icon">🍽️</div>
      <h1 class="login-title">家庭点单管理后台</h1>
      <p class="login-desc">输入昵称登录系统</p>
      <el-input
        v-model="nickname"
        placeholder="请输入昵称"
        size="large"
        class="login-input"
        @keyup.enter="login"
      />
      <el-button type="primary" size="large" class="login-btn" @click="login" :loading="loading">
        登录
      </el-button>
      <p class="login-tip">首次登录自动创建账号</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const nickname = ref('')
const loading = ref(false)

async function login() {
  if (!nickname.value.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }
  loading.value = true
  try {
    const res = await api.post('/auth/login', { nickname: nickname.value.trim() })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('member', JSON.stringify(res.data.member))
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  width: 400px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
.login-icon {
  font-size: 64px;
  margin-bottom: 12px;
}
.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}
.login-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}
.login-input {
  margin-bottom: 16px;
}
.login-btn {
  width: 100%;
}
.login-tip {
  font-size: 12px;
  color: #bbb;
  margin-top: 12px;
}
</style>
