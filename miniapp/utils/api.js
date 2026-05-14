const app = getApp();

const BASE_URL = app.globalData.baseUrl;

function request(method: string, path: string, data?: any): Promise<any> {
  const token = wx.getStorageSync('token');
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${path}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('member');
          wx.reLaunch({ url: '/pages/profile/profile' });
          reject(new Error('登录已过期'));
        } else {
          reject(new Error(res.data?.error || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络异常，请检查服务器是否启动'));
      },
    });
  });
}

export const api = {
  // 登录
  login(nickname: string) {
    return request('POST', '/auth/login', { nickname });
  },

  // 获取用户信息
  getMe() {
    return request('GET', '/auth/me');
  },

  // 获取可用菜单（按分类分组）
  getAvailableDishes() {
    return request('GET', '/dishes/available');
  },

  // 获取所有菜品（管理用）
  getDishes(params?: any) {
    return request('GET', '/dishes', params);
  },

  // 创建菜品
  createDish(data: any) {
    return request('POST', '/dishes', data);
  },

  // 更新菜品
  updateDish(id: number, data: any) {
    return request('PUT', `/dishes/${id}`, data);
  },

  // 删除菜品
  deleteDish(id: number) {
    return request('DELETE', `/dishes/${id}`);
  },

  // 获取分类
  getCategories() {
    return request('GET', '/categories');
  },

  // 创建分类
  createCategory(data: any) {
    return request('POST', '/categories', data);
  },

  // 更新分类
  updateCategory(id: number, data: any) {
    return request('PUT', `/categories/${id}`, data);
  },

  // 删除分类
  deleteCategory(id: number) {
    return request('DELETE', `/categories/${id}`);
  },

  // 创建订单
  createOrder(items: any[], remark?: string) {
    return request('POST', '/orders', { items, remark });
  },

  // 获取订单列表
  getOrders(status?: string) {
    const params: any = {};
    if (status) params.status = status;
    return request('GET', '/orders', params);
  },

  // 获取订单详情
  getOrder(id: number) {
    return request('GET', `/orders/${id}`);
  },

  // 更新订单状态
  updateOrderStatus(id: number, status: string) {
    return request('PUT', `/orders/${id}/status`, { status });
  },

  // 获取成员列表
  getMembers() {
    return request('GET', '/members');
  },

  // 更新成员角色
  updateMemberRole(id: number, role: string) {
    return request('PUT', `/members/${id}/role`, { role });
  },

  // 删除成员
  deleteMember(id: number) {
    return request('DELETE', `/members/${id}`);
  },

  // 获取统计数据
  getStats() {
    return request('GET', '/members/stats');
  },

  // 上传图片
  uploadImage(filePath: string) {
    const token = wx.getStorageSync('token');
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${BASE_URL}/upload`,
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`,
        },
        success: (res: any) => {
          try {
            resolve(JSON.parse(res.data));
          } catch {
            reject(new Error('上传失败'));
          }
        },
        fail: () => reject(new Error('上传失败')),
      });
    });
  },
};
