// pages/login/login.js
const app = getApp()

Page({
  data: {
    nickname: ''
  },

  onInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  login() {
    const nickname = this.data.nickname.trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'error' })
      return
    }

    wx.showLoading({ title: '登录中...' })
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/auth/login`,
      method: 'POST',
      data: { nickname },
      success: (res) => {
        if (res.statusCode === 200) {
          const userInfo = res.data.member
          app.globalData.userInfo = userInfo
          wx.setStorageSync('userInfo', userInfo)
          
          wx.showToast({ title: '欢迎！', icon: 'success' })
          setTimeout(() => {
            wx.switchTab({ url: '/pages/index/index' })
          }, 1000)
        } else {
          wx.showToast({ title: res.data.detail || '登录失败', icon: 'error' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'error' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
})
