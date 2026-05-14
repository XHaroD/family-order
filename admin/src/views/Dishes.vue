<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">🍽️ 菜品管理</h2>
      <el-button type="primary" @click="openAdd">+ 添加菜品</el-button>
    </div>

    <el-card>
      <el-table :data="dishes" stripe>
        <el-table-column prop="name" label="菜品名称" width="160" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="toggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="doDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜品' : '添加菜品'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="菜品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="form.categoryId" style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.icon + ' ' + c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0.5" :step="0.5" :precision="2" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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

const dishes = ref<any[]>([])
const categories = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const form = ref({ name: '', categoryId: 0, price: 10, description: '' })

async function loadData() {
  const [dRes, cRes] = await Promise.all([
    api.get('/dishes', { params: { status: undefined } }),
    api.get('/categories'),
  ])
  dishes.value = dRes.data.data
  categories.value = cRes.data.data
}

function openAdd() {
  isEdit.value = false
  editId.value = 0
  form.value = {
    name: '',
    categoryId: categories.value[0]?.id || 0,
    price: 10,
    description: '',
  }
  dialogVisible.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  form.value = {
    name: row.name,
    categoryId: row.category_id,
    price: row.price,
    description: row.description || '',
  }
  dialogVisible.value = true
}

async function save() {
  try {
    if (isEdit.value) {
      await api.put(`/dishes/${editId.value}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await api.post('/dishes', form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '保存失败')
  }
}

async function toggleStatus(row: any) {
  try {
    await api.put(`/dishes/${row.id}`, { status: row.status })
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

async function doDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该菜品？', '提示')
    await api.delete(`/dishes/${id}`)
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
