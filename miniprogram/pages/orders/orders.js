// pages/orders/orders.js
const app = getApp()

Page({
  data: {
    orders: [],
    activeStatus: ''
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders()
    wx.stopPullDownRefresh()
  },

  loadOrders() {
    const status = this.data.activeStatus
    let url = `${app.globalData.baseUrl}/api/orders`
    if (status) {
      url += `?status=${status}`
    }

    wx.request({
      url,
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ orders: res.data.data })
        }
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'error' })
      }
    })
  },

  onStatusChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ activeStatus: status })
    this.loadOrders()
  },

  updateStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const statusText = {
      cooking: '开始制作',
      done: '完成',
      cancelled: '取消'
    }

    wx.showModal({
      title: '确认操作',
      content: `确定${statusText[status]}该订单？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/api/orders/${id}/status`,
            method: 'PUT',
            data: { status },
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({ title: '操作成功', icon: 'success' })
                this.loadOrders()
              } else {
                wx.showToast({ title: '操作失败', icon: 'error' })
              }
            }
          })
        }
      }
    })
  }
})
