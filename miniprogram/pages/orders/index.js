// pages/order/index.js
const app = getApp()

Page({
  data: {
    dishId: 0,
    dishName: '',
    price: 0,
    quantity: 1,
    memberName: '',
    note: '',
    total: 0,
    submitting: false
  },

  onLoad(options) {
    this.setData({
      dishId: parseInt(options.dishId),
      dishName: options.dishName,
      price: parseFloat(options.price)
    })
  },

  onNameInput(e) {
    this.setData({ memberName: e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  increase() {
    const quantity = this.data.quantity + 1
    this.setData({ quantity, total: quantity * this.data.price })
  },

  decrease() {
    if (this.data.quantity > 1) {
      const quantity = this.data.quantity - 1
      this.setData({ quantity, total: quantity * this.data.price })
    }
  },

  submitOrder() {
    if (!this.data.memberName.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'error' })
      return
    }

    this.setData({ submitting: true })
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/orders`,
      method: 'POST',
      data: {
        dish_id: this.data.dishId,
        quantity: this.data.quantity,
        note: this.data.note,
        member_name: this.data.memberName
      },
      success: (res) => {
        wx.showToast({ title: '下单成功！', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/orders/index' })
        }, 1500)
      },
      fail: () => {
        wx.showToast({ title: '下单失败', icon: 'error' })
      },
      complete: () => {
        this.setData({ submitting: false })
      }
    })
  }
})
