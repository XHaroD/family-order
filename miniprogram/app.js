// app.js
App({
  globalData: {
    baseUrl: 'http://192.168.31.62:8000',
    userInfo: null,
    cart: []  // 购物车
  },

  onLaunch() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    // 加载购物车
    const cart = wx.getStorageSync('cart')
    if (cart) {
      this.globalData.cart = cart
    }
  },

  // 保存购物车到本地
  saveCart() {
    wx.setStorageSync('cart', this.globalData.cart)
  },

  // 添加到购物车
  addToCart(dish, quantity = 1, note = '') {
    const cart = this.globalData.cart
    const existIndex = cart.findIndex(item => item.dish_id === dish.id)
    
    if (existIndex > -1) {
      cart[existIndex].quantity += quantity
      if (note) cart[existIndex].note = note
    } else {
      cart.push({
        dish_id: dish.id,
        dish_name: dish.name,
        quantity: quantity,
        note: note
      })
    }
    
    this.globalData.cart = cart
    this.saveCart()
  },

  // 清空购物车
  clearCart() {
    this.globalData.cart = []
    this.saveCart()
  },

  // 获取购物车总数量
  getCartCount() {
    return this.globalData.cart.reduce((sum, item) => sum + item.quantity, 0)
  }
})
