# 家庭点单系统 - 微信小程序

## 快速开始

### 1. 打开微信开发者工具

下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择 `miniprogram` 文件夹
4. AppID 可以选择「测试号」或使用自己的 AppID
5. 点击「导入」

### 3. 开启不校验合法域名

**重要：** 因为后端运行在本地/内网，需要关闭域名校验

1. 点击右上角「详情」按钮
2. 选择「本地设置」选项卡
3. 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」

### 4. 配置服务器地址

编辑 `app.js` 文件，修改 `baseUrl` 为你的后端地址：

```javascript
globalData: {
  baseUrl: 'http://你的服务器IP:8000',  // 修改为实际地址
  // ...
}
```

### 5. 编译运行

点击工具栏的「编译」按钮即可预览小程序

---

## 后端服务

确保后端服务已启动：

```bash
cd backend
pip install -r requirements.txt
python init_db.py  # 初始化数据库
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 功能说明

- **菜单页**：浏览菜品，点击加入购物车
- **购物车**：查看已选菜品，调整数量，提交订单
- **订单页**：查看所有订单，支持状态筛选

## 默认账号

首次使用输入昵称即可自动创建账号
