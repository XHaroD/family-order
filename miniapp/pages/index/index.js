Page({
  data: {
    categories: [],
    currentCategory: null,
    cart: [],        // { dish, quantity }
    cartTotal: 0,
    cartCount: 0,
    showCart: false,
    loading: true,
    remark: '',
  },

  onLoad() {
    this.loadMenu();
  },

  onShow() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
    }
  },

  async loadMenu() {
    this.setData({ loading: true });
    try {
      const { api } = require('../../utils/api');
      const res = await api.getAvailableDishes();
      this.setData({
        categories: res.data,
        currentCategory: res.data.length > 0 ? res.data[0].id : null,
        loading: false,
      });
    } catch (err: any) {
      this.setData({ loading: false });
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    }
  },

  switchCategory(e: any) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentCategory: id });
  },

  /** 加入购物车 */
  addToCart(e: any) {
    const dish = e.currentTarget.dataset.dish;
    let cart = [...this.data.cart];
    const idx = cart.findIndex((item: any) => item.dish.id === dish.id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ dish, quantity: 1 });
    }
    this.updateCart(cart);
    wx.showToast({ title: '已加入', icon: 'success', duration: 600 });
  },

  /** 修改购物车数量 */
  changeQty(e: any) {
    const { dishId, delta } = e.currentTarget.dataset;
    let cart = [...this.data.cart];
    const idx = cart.findIndex((item: any) => item.dish.id === Number(dishId));
    if (idx === -1) return;

    cart[idx].quantity += Number(delta);
    if (cart[idx].quantity <= 0) {
      cart.splice(idx, 1);
    }
    this.updateCart(cart);
  },

  updateCart(cart: any[]) {
    let total = 0;
    let count = 0;
    cart.forEach((item: any) => {
      total += item.dish.price * item.quantity;
      count += item.quantity;
    });
    this.setData({
      cart,
      cartTotal: total.toFixed(2),
      cartCount: count,
    });
  },

  toggleCart() {
    this.setData({ showCart: !this.data.showCart });
  },

  clearCart() {
    wx.showModal({
      title: '提示',
      content: '清空购物车？',
      success: (res) => {
        if (res.confirm) {
          this.updateCart([]);
        }
      },
    });
  },

  onRemarkInput(e: any) {
    this.setData({ remark: e.detail.value });
  },

  /** 提交订单 */
  async submitOrder() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (this.data.cart.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }

    const items = this.data.cart.map((item: any) => ({
      dishId: item.dish.id,
      quantity: item.quantity,
    }));

    wx.showLoading({ title: '提交中...' });

    try {
      const { api } = require('../../utils/api');
      await api.createOrder(items, this.data.remark);
      wx.hideLoading();
      wx.showToast({ title: '下单成功！', icon: 'success' });
      this.updateCart([]);
      this.setData({ remark: '', showCart: false });
    } catch (err: any) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '下单失败', icon: 'none' });
    }
  },
});
