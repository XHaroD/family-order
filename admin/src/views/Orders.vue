<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">📋 订单管理</h2>
      <div>
        <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width:140px" @change="loadOrders">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="制作中" value="cooking" />
          <el-option label="已完成" value="done" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
    </div>

    <el-card>
      <el-table :data="orders" stripe>
        <el-table-column prop="order_no" label="订单号" width="200" />
        <el-table-column prop="member_name" label="下单人" width="100" />
        <el-table-column label="菜品" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="item in row.items" :key="item.id" size="small" style="margin:2px">
              {{ item.dish_name }} ×{{ item.quantity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">¥{{ row.total_price }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="large">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" width="150" />
        <el-table-column prop="created_at" label="时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="primary"
              @click="updateStatus(row.id, 'cooking')"
            >
              开始制作
            </el-button>
            <el-button
              v-if="row.status === 'cooking'"
              size="small"
              type="success"
              @click="updateStatus(row.id, 'done')"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status !== 'done' && row.status !== 'cancelled'"
              size="small"
              type="info"
              @click="updateStatus(row.id, 'cancelled')"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const orders = ref<any[]>([])
const statusFilter = ref('')

function statusText(s: string) {
  const map: Record<string, string> = { pending: '待处理', cooking: '制作中', done: '已完成', cancelled: '已取消' }
  return map[s] || s
}
function statusType(s: string) {
  const map: Record<string, string> = { pending: 'warning', cooking: 'primary', done: 'success', cancelled: 'info' }
  return map[s] || ''
}

async function loadOrders() {
  try {
    const params: any = {}
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/orders', { params })
    orders.value = res.data.data
  } catch {}
}

async function updateStatus(id: number, status: string) {
  try {
    await api.put(`/orders/${id}/status`, { status })
    ElMessage.success('更新成功')
    loadOrders()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '更新失败')
  }
}

onMounted(loadOrders)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; }
</style>
