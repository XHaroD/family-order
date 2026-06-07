# 家庭点单系统 🍽️

一个简单的家庭点餐微信小程序，支持点餐、购物车、订单管理。

## 快速开始

### 1. 启动后端服务

```bash
# 一键启动
chmod +x start.sh
./start.sh
```

或手动启动：

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r backend/requirements.txt

# 初始化数据库
cd backend
python init_db.py

# 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. 打开微信小程序

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `miniprogram` 文件夹
3. **重要：** 在「详情」→「本地设置」中勾选「不校验合法域名」
4. 编辑 `app.js` 修改服务器地址
5. 点击「编译」运行

---

## 功能特性

- 📱 微信小程序点餐
- 🛒 购物车功能
- 👤 昵称登录（自动创建账号）
- 📋 订单管理（待处理/制作中/已完成）
- 🏷️ 菜品分类

## 项目结构

```
family-order/
├── backend/                # 后端 API
│   ├── main.py            # FastAPI 主程序
│   ├── models.py          # 数据库模型
│   ├── database.py        # 数据库连接
│   └── init_db.py         # 数据库初始化
├── miniprogram/           # 微信小程序
│   ├── pages/
│   │   ├── index/         # 菜单首页
│   │   ├── login/         # 登录页
│   │   ├── cart/          # 购物车
│   │   └── orders/        # 订单列表
│   ├── app.js
│   ├── app.json
│   └── project.config.json
├── start.sh               # 一键启动脚本
└── README.md
```

## API 文档

启动后端后访问：http://localhost:8000/docs

### 主要接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 登录 |
| `/api/dishes` | GET | 获取菜品列表 |
| `/api/categories` | GET | 获取分类列表 |
| `/api/orders` | POST | 创建订单 |
| `/api/orders` | GET | 获取订单列表 |
| `/api/orders/{id}/status` | PUT | 更新订单状态 |

## 默认菜品

| 菜品 | 分类 |
|------|------|
| 米饭 | 主食 |
| 红烧肉 | 荤菜 |
| 西红柿炒蛋 | 素菜 |
| 紫菜蛋花汤 | 汤 |
| 可乐 | 饮料 |
| 宫保鸡丁 | 荤菜 |

## 数据库

使用 MySQL 8.4，连接配置在 `backend/.env` 文件中。

## License

MIT
