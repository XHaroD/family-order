App({
  globalData: {
    baseUrl: 'http://localhost:3000/api',
    token: '',
    member: null,
  },
  onLaunch() {
    // 读取本地 token
    const token = wx.getStorageSync('token');
    const member = wx.getStorageSync('member');
    if (token) {
      this.globalData.token = token;
      this.globalData.member = member;
    }
  },
});
