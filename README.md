# 家庭点单系统 🍽️

一个简单的家庭点餐系统，支持微信小程序点餐、购物车、订单管理。

## 功能特性

- 📱 微信小程序点餐
- 🛒 购物车功能
- 👤 昵称登录
- 📋 订单管理（待处理/制作中/已完成）
- 🏷️ 菜品分类管理
- 👨‍👩‍👧‍👦 多成员支持

## 技术栈

### 后端
- Python 3.11
- FastAPI
- SQLAlchemy
- MySQL 8.4

### 前端
- 微信小程序原生框架

## 项目结构

```
family-order/
├── backend/            # 后端 API
│   ├── main.py         # FastAPI 主程序
│   ├── models.py       # 数据库模型
│   ├── database.py     # 数据库连接
│   └── init_db.py      # 数据库初始化脚本
├── miniprogram/        # 微信小程序
│   ├── pages/
│   │   ├── index/      # 菜单首页
│   │   ├── login/      # 登录页
│   │   ├── cart/       # 购物车
│   │   └── orders/     # 订单列表
│   ├── app.js
│   ├── app.json
│   └── app.wxss
└── README.md
```

## 快速开始

### 1. 数据库配置

确保 MySQL 已启动，创建数据库：

```sql
CREATE DATABASE family_order CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'family_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON family_order.* TO 'family_user'@'%';
FLUSH PRIVILEGES;
```

### 2. 后端启动

```bash
cd backend
pip install -r requirements.txt

# 初始化数据库
python init_db.py

# 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 小程序配置

1. 用微信开发者工具打开 `miniprogram` 目录
2. 修改 `app.js` 中的 `baseUrl` 为你的后端地址
3. 编译运行

## API 文档

启动后端后访问：`http://localhost:8000/docs`

### 主要接口

- `POST /api/auth/login` - 登录
- `GET /api/dishes` - 获取菜品列表
- `GET /api/categories` - 获取分类列表
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `PUT /api/orders/{id}/status` - 更新订单状态

## 默认数据

系统初始化后包含以下菜品：

| 菜品 | 分类 |
|------|------|
| 米饭 | 主食 |
| 红烧肉 | 荤菜 |
| 西红柿炒蛋 | 素菜 |
| 紫菜蛋花汤 | 汤 |
| 可乐 | 饮料 |
| 宫保鸡丁 | 荤菜 |

## 部署说明

### Docker 部署（推荐）

```bash
# MySQL
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -v /path/to/mysql:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.4

# 后端
cd backend
docker build -t family-order-api .
docker run -d -p 8000:8000 family-order-api
```

## License

MIT
