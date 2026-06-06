// pages/cart/cart.js
const app = getApp()

Page({
  data: {
    cart: [],
    totalPrice: 0,
    remark: ''
  },

  onLoad() {
    this.refreshCart()
  },

  onShow() {
    this.refreshCart()
  },

  refreshCart() {
    const cart = app.globalData.cart
    const totalPrice = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    this.setData({ cart, totalPrice })
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

  checkout() {
    const userInfo = app.globalData.userInfo
    if (!userInfo) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }

    if (this.data.cart.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'error' })
      return
    }

    wx.showLoading({ title: '提交中...' })
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/orders`,
      method: 'POST',
      data: {
        member_id: userInfo.id,
        items: this.data.cart,
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
