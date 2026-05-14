<template>
  <div>
    <h2 class="page-title">📊 数据概览</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ statsData.length }}</div>
          <div class="stat-label">家庭成员</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" style="color:#409EFF">{{ totalOrders }}</div>
          <div class="stat-label">总订单</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" style="color:#E6A23C">¥{{ totalSpent }}</div>
          <div class="stat-label">总消费</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" style="color:#67C23A">{{ dishCount }}</div>
          <div class="stat-label">菜品数量</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成员消费排行 -->
    <el-card class="section-card">
      <template #header><span>👥 成员消费排行</span></template>
      <el-table :data="statsData" stripe>
        <el-table-column prop="nickname" label="成员" width="180">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : row.role === 'chef' ? 'warning' : 'info'" size="small">
              {{ row.role === 'admin' ? '管理员' : row.role === 'chef' ? '大厨' : '成员' }}
            </el-tag>
            {{ row.nickname }}
          </template>
        </el-table-column>
        <el-table-column prop="order_count" label="订单数" width="120" />
        <el-table-column prop="completed_orders" label="已完成" width="120" />
        <el-table-column prop="total_spent" label="总消费 (¥)" />
      </el-table>
    </el-card>

    <!-- 最近订单 -->
    <el-card class="section-card">
      <template #header><span>📋 最近订单</span></template>
      <el-table :data="recentOrders" stripe>
        <el-table-column prop="order_no" label="订单号" width="200" />
        <el-table-column prop="member_name" label="下单人" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_price" label="金额" width="100">
          <template #default="{ row }">¥{{ row.total_price }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'

const statsData = ref<any[]>([])
const recentOrders = ref<any[]>([])
const totalOrders = ref(0)
const totalSpent = ref('0')
const dishCount = ref(0)

function statusText(s: string) {
  const map: Record<string, string> = { pending: '待处理', cooking: '制作中', done: '已完成', cancelled: '已取消' }
  return map[s] || s
}
function statusType(s: string) {
  const map: Record<string, string> = { pending: 'warning', cooking: 'primary', done: 'success', cancelled: 'info' }
  return map[s] || ''
}

onMounted(async () => {
  try {
    const [statsRes, ordersRes, dishesRes] = await Promise.all([
      api.get('/members/stats'),
      api.get('/orders'),
      api.get('/dishes'),
    ])
    statsData.value = statsRes.data.data
    recentOrders.value = ordersRes.data.data.slice(0, 10)
    totalOrders.value = ordersRes.data.data.length
    const sum = ordersRes.data.data.reduce((s: number, o: any) => s + Number(o.total_price || 0), 0)
    totalSpent.value = sum.toFixed(2)
    dishCount.value = dishesRes.data.data.length
  } catch {}
})
</script>

<style scoped>
.page-title { margin-bottom: 20px; font-size: 22px; }
.stats-row { margin-bottom: 20px; }
.stat-card { text-align: center; padding: 10px; }
.stat-value { font-size: 32px; font-weight: 700; color: #303133; }
.stat-label { font-size: 14px; color: #909399; margin-top: 8px; }
.section-card { margin-bottom: 20px; }
</style>
