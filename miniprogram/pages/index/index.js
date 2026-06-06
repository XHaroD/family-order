// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    categories: [],
    dishes: [],
    activeCategory: 0,
    cartCount: 0
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.setData({ cartCount: app.getCartCount() })
  },

  checkLogin() {
    const userInfo = app.globalData.userInfo
    if (!userInfo) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.setData({ userInfo })
    this.loadData()
  },

  loadData() {
    this.loadCategories()
    this.loadDishes()
  },

  loadCategories() {
    wx.request({
      url: `${app.globalData.baseUrl}/api/categories`,
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ categories: res.data.data })
        }
      }
    })
  },

  loadDishes() {
    wx.showLoading({ title: '加载中...' })
    wx.request({
      url: `${app.globalData.baseUrl}/api/dishes`,
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ dishes: res.data.data })
        }
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'error' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ activeCategory: categoryId })
    
    if (categoryId === 0) {
      this.loadDishes()
    } else {
      wx.request({
        url: `${app.globalData.baseUrl}/api/dishes?category_id=${categoryId}`,
        success: (res) => {
          if (res.data.code === 0) {
            this.setData({ dishes: res.data.data })
          }
        }
      })
    }
  },

  addToCart(e) {
    const dish = e.currentTarget.dataset.item
    app.addToCart(dish)
    this.setData({ cartCount: app.getCartCount() })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  }
})
