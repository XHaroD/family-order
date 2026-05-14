Page({
  data: {
    tab: 'orders',  // orders | dishes | categories
    orders: [],
    dishes: [],
    categories: [],
    // 编辑菜品弹窗
    showDishForm: false,
    editDish: null,
    dishForm: { name: '', price: '', categoryId: 0, description: '' },
    // 编辑分类弹窗
    showCategoryForm: false,
    editCategory: null,
    categoryForm: { name: '', icon: '' },
  },

  onShow() {
    this.checkAuth();
  },

  checkAuth() {
    const member = wx.getStorageSync('member');
    if (!member || (member.role !== 'admin' && member.role !== 'chef')) {
      wx.showToast({ title: '无权访问', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.loadAll();
  },

  async loadAll() {
    try {
      const { api } = require('../../utils/api');
      const [ordersRes, dishesRes, categoriesRes] = await Promise.all([
        api.getOrders(),
        api.getDishes({ status: undefined }),
        api.getCategories(),
      ]);
      this.setData({
        orders: ordersRes.data,
        dishes: dishesRes.data,
        categories: categoriesRes.data,
      });
    } catch (err: any) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    }
  },

  switchTab(e: any) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  /* ========== 订单操作 ========== */
  async updateOrderStatus(e: any) {
    const { id, status } = e.currentTarget.dataset;
    wx.showLoading({ title: '更新中...' });
    try {
      const { api } = require('../../utils/api');
      await api.updateOrderStatus(Number(id), status);
      wx.hideLoading();
      wx.showToast({ title: '更新成功', icon: 'success' });
      this.loadAll();
    } catch (err: any) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '更新失败', icon: 'none' });
    }
  },

  /* ========== 菜品操作 ========== */
  showAddDish() {
    const catId = this.data.categories.length > 0 ? this.data.categories[0].id : 0;
    this.setData({
      showDishForm: true,
      editDish: null,
      dishForm: { name: '', price: '', categoryId: catId, description: '' },
    });
  },

  showEditDish(e: any) {
    const dish = e.currentTarget.dataset.dish;
    this.setData({
      showDishForm: true,
      editDish: dish,
      dishForm: {
        name: dish.name,
        price: String(dish.price),
        categoryId: dish.category_id,
        description: dish.description || '',
      },
    });
  },

  onDishFieldChange(e: any) {
    const { field } = e.currentTarget.dataset;
    const form = { ...this.data.dishForm, [field]: e.detail.value };
    this.setData({ dishForm: form });
  },

  onDishCategoryChange(e: any) {
    const catId = Number(e.currentTarget.dataset.catid);
    this.setData({ 'dishForm.categoryId': catId });
  },

  async saveDish() {
    const { name, price, categoryId, description } = this.data.dishForm;
    if (!name || !price || !categoryId) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '保存中...' });
    try {
      const { api } = require('../../utils/api');
      const data = {
        name,
        price: Number(price),
        categoryId: Number(categoryId),
        description,
      };
      if (this.data.editDish) {
        await api.updateDish(this.data.editDish.id, data);
      } else {
        await api.createDish(data);
      }
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      this.setData({ showDishForm: false });
      this.loadAll();
    } catch (err: any) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    }
  },

  async deleteDish(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            const { api } = require('../../utils/api');
            await api.deleteDish(id);
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadAll();
          } catch (err: any) {
            wx.hideLoading();
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      },
    });
  },

  /* ========== 分类操作 ========== */
  showAddCategory() {
    this.setData({
      showCategoryForm: true,
      editCategory: null,
      categoryForm: { name: '', icon: '🥘' },
    });
  },

  showEditCategory(e: any) {
    const cat = e.currentTarget.dataset.category;
    this.setData({
      showCategoryForm: true,
      editCategory: cat,
      categoryForm: { name: cat.name, icon: cat.icon || '🥘' },
    });
  },

  onCategoryFieldChange(e: any) {
    const { field } = e.currentTarget.dataset;
    const form = { ...this.data.categoryForm, [field]: e.detail.value };
    this.setData({ categoryForm: form });
  },

  async saveCategory() {
    const { name, icon } = this.data.categoryForm;
    if (!name) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '保存中...' });
    try {
      const { api } = require('../../utils/api');
      if (this.data.editCategory) {
        await api.updateCategory(this.data.editCategory.id, { name, icon });
      } else {
        await api.createCategory({ name, icon });
      }
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      this.setData({ showCategoryForm: false });
      this.loadAll();
    } catch (err: any) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    }
  },

  async deleteCategory(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '删除分类会同时删除该分类下所有菜品',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            const { api } = require('../../utils/api');
            await api.deleteCategory(id);
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadAll();
          } catch (err: any) {
            wx.hideLoading();
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      },
    });
  },

  getStatusText(status: string) {
    const map: Record<string, string> = {
      pending: '待处理',
      cooking: '制作中',
      done: '已完成',
      cancelled: '已取消',
    };
    return map[status] || status;
  },
});
