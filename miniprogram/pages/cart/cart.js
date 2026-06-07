// pages/cart/cart.js
const app = getApp()

Page({
  data: {
    cart: [],
    cartCount: 0,
    remark: '',
    userInfo: null,
    nicknameInput: ''
  },

  onLoad() {
    this.refreshCart()
  },

  onShow() {
    this.refreshCart()
    this.setData({ userInfo: app.globalData.userInfo })
  },

  refreshCart() {
    const cart = app.globalData.cart
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    this.setData({ cart, cartCount })
  },

  increase(e) {
    const index = e.currentTarget.dataset.index
    app.globalData.cart[index].quantity++
    app.saveCart()
    this.refreshCart()
  },

  decrease(e) {
    const index = e.currentTarget.dataset.index
    if (app.globalData.cart[index].quantity > 1) {
      app.globalData.cart[index].quantity--
    } else {
      app.globalData.cart.splice(index, 1)
    }
    app.saveCart()
    this.refreshCart()
  },

  removeItem(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: `确定删除 ${app.globalData.cart[index].dish_name}？`,
      success: (res) => {
        if (res.confirm) {
          app.globalData.cart.splice(index, 1)
          app.saveCart()
          this.refreshCart()
        }
      }
    })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  onNicknameInput(e) {
    this.setData({ nicknameInput: e.detail.value })
  },

  changeNickname() {
    this.setData({ 
      nicknameInput: this.data.userInfo.nickname,
      userInfo: null
    })
  },

  checkout() {
    // 检查昵称
    let nickname = this.data.userInfo ? this.data.userInfo.nickname : this.data.nicknameInput.trim()
    
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'error' })
      return
    }

    // 保存昵称
    if (!this.data.userInfo) {
      app.setNickname(nickname)
      this.setData({ userInfo: { nickname } })
    }

    if (this.data.cart.length === 0) {
      wx.showToast({ title: '还没选菜', icon: 'error' })
      return
    }

    wx.showLoading({ title: '提交中...' })
    
    // 构建订单项
    const items = this.data.cart.map(item => ({
      dish_id: item.dish_id,
      dish_name: item.dish_name,
      quantity: item.quantity,
      note: item.note || ''
    }))

    wx.request({
      url: `${app.globalData.baseUrl}/api/orders`,
      method: 'POST',
      data: {
        member_name: nickname,
        items: items,
        remark: this.data.remark
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          app.clearCart()
          wx.showToast({ title: '下单成功！', icon: 'success' })
          setTimeout(() => {
            wx.switchTab({ url: '/pages/orders/orders' })
          }, 1500)
        } else {
          wx.showToast({ title: res.data.detail || '下单失败', icon: 'error' })
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
