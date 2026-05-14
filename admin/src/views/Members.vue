<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">👥 成员管理</h2>
    </div>

    <el-card>
      <el-table :data="members" stripe>
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <el-select v-model="row.role" size="small" @change="(val: string) => updateRole(row.id, val)">
              <el-option label="家庭成员" value="member" />
              <el-option label="大厨" value="chef" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="family_code" label="家庭码" width="160" />
        <el-table-column prop="created_at" label="加入时间" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="danger"
              :disabled="row.role === 'admin'"
              @click="doDelete(row.id)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const members = ref<any[]>([])

async function loadMembers() {
  const res = await api.get('/members')
  members.value = res.data.data
}

async function updateRole(id: number, role: string) {
  try {
    await api.put(`/members/${id}/role`, { role })
    ElMessage.success('角色已更新')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '更新失败')
    loadMembers()
  }
}

async function doDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定移除该成员？', '提示')
    await api.delete(`/members/${id}`)
    ElMessage.success('已移除')
    loadMembers()
  } catch {}
}

onMounted(loadMembers)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; }
</style>
