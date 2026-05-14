Page({
  data: {
    loggedIn: false,
    member: null,
    stats: null,
  },

  onShow() {
    const token = wx.getStorageSync('token');
    const member = wx.getStorageSync('member');
    if (token && member) {
      this.setData({ loggedIn: true, member });
      this.loadStats();
    } else {
      this.setData({ loggedIn: false, member: null });
    }
  },

  onInputNickname(e: any) {
    this.nickname = e.detail.value;
  },

  async login() {
    const nickname = this.nickname || '';
    if (!nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '登录中...' });
    try {
      const { api } = require('../../utils/api');
      const res = await api.login(nickname.trim());
      wx.setStorageSync('token', res.token);
      wx.setStorageSync('member', res.member);
      this.setData({
        loggedIn: true,
        member: res.member,
      });
      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });
    } catch (err: any) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
    }
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('member');
          this.setData({ loggedIn: false, member: null, stats: null });
        }
      },
    });
  },

  async loadStats() {
    try {
      const { api } = require('../../utils/api');
      const res = await api.getStats();
      const memberStats = res.data.find((s: any) => s.id === this.data.member.id);
      this.setData({ stats: memberStats });
    } catch {}
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  },
});
