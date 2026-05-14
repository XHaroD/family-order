<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">📂 分类管理</h2>
      <el-button type="primary" @click="openAdd">+ 添加分类</el-button>
    </div>

    <el-card>
      <el-table :data="categories" stripe>
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <span style="font-size:24px">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="dish_count" label="菜品数量" width="120" />
        <el-table-column prop="sort_order" label="排序" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="doDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '添加分类'" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="如 🥘" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const categories = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const form = ref({ name: '', icon: '🥘', sortOrder: 0 })

async function loadData() {
  const res = await api.get('/categories')
  categories.value = res.data.data
}

function openAdd() {
  isEdit.value = false
  editId.value = 0
  form.value = { name: '', icon: '🥘', sortOrder: 0 }
  dialogVisible.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  form.value = { name: row.name, icon: row.icon || '🥘', sortOrder: row.sort_order }
  dialogVisible.value = true
}

async function save() {
  try {
    if (isEdit.value) {
      await api.put(`/categories/${editId.value}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await api.post('/categories', form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '保存失败')
  }
}

async function doDelete(id: number) {
  try {
    await ElMessageBox.confirm('删除分类会同时删除该分类下所有菜品，确认？', '提示')
    await api.delete(`/categories/${id}`)
    ElMessage.success('已删除')
    loadData()
  } catch {}
}

onMounted(loadData)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; }
</style>
