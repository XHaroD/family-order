Page({
  data: {
    order: null,
    isChefOrAdmin: false,
  },

  onLoad(options: any) {
    const id = options.id;
    if (id) {
      this.loadOrder(id);
    }
    const member = wx.getStorageSync('member');
    this.setData({
      isChefOrAdmin: member?.role === 'admin' || member?.role === 'chef',
    });
  },

  async loadOrder(id: number) {
    wx.showLoading({ title: '加载中...' });
    try {
      const { api } = require('../../utils/api');
      const res = await api.getOrder(id);
      this.setData({ order: res.data });
      wx.hideLoading();
    } catch (err: any) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    }
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

  async updateStatus(e: any) {
    const status = e.currentTarget.dataset.status;
    wx.showLoading({ title: '更新中...' });
    try {
      const { api } = require('../../utils/api');
      await api.updateOrderStatus(this.data.order.id, status);
      wx.hideLoading();
      wx.showToast({ title: '更新成功', icon: 'success' });
      this.loadOrder(this.data.order.id);
    } catch (err: any) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '更新失败', icon: 'none' });
    }
  },
});
