Page({
  data: {
    orders: [],
    statusFilter: '',
    filters: [
      { label: '全部', value: '' },
      { label: '待处理', value: 'pending' },
      { label: '制作中', value: 'cooking' },
      { label: '已完成', value: 'done' },
      { label: '已取消', value: 'cancelled' },
    ],
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    try {
      const { api } = require('../../utils/api');
      const res = await api.getOrders(this.data.statusFilter);
      this.setData({ orders: res.data });
    } catch (err: any) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    }
  },

  setFilter(e: any) {
    const value = e.currentTarget.dataset.value;
    this.setData({ statusFilter: value }, () => {
      this.loadOrders();
    });
  },

  goDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
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
