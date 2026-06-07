// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    categories: [],
    dishes: [],
    activeCategory: 0,
    cartCount: 0,
    showNicknameModal: false,
    nicknameInput: ''
  },

  onLoad() {
    this.checkUser()
  },

  onShow() {
    this.setData({ cartCount: app.getCartCount() })
  },

  checkUser() {
    const userInfo = app.globalData.userInfo
    if (!userInfo) {
      // 显示用户名输入弹窗
      this.setData({ showNicknameModal: true })
    } else {
      this.setData({ userInfo })
      this.loadData()
    }
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
    if (!app.globalData.userInfo) {
      this.setData({ showNicknameModal: true })
      return
    }
    const dish = e.currentTarget.dataset.item
    app.addToCart(dish)
    this.setData({ cartCount: app.getCartCount() })
    wx.showToast({ title: '已加入', icon: 'success', duration: 800 })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  },

  // 昵称相关
  onNicknameInput(e) {
    this.setData({ nicknameInput: e.detail.value })
  },

  confirmNickname() {
    const nickname = this.data.nicknameInput.trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'error' })
      return
    }
    app.setNickname(nickname)
    this.setData({ 
      userInfo: { nickname },
      showNicknameModal: false,
      nicknameInput: ''
    })
    this.loadData()
  },

  changeNickname() {
    this.setData({ 
      showNicknameModal: true,
      nicknameInput: this.data.userInfo.nickname
    })
  },

  hideNicknameModal() {
    if (app.globalData.userInfo) {
      this.setData({ showNicknameModal: false })
    }
  }
})
