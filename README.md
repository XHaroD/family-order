# 🍽️ 家庭点单系统

一个面向家庭内部使用的点单小程序 + 管理后台，支持微信小程序点单、Web 管理后台、订单状态流转。

## 📸 项目截图

| 小程序点单 | 订单列表 | Web 管理后台 |
|-----------|---------|------------|
| 分类浏览 + 购物车 | 订单状态跟踪 | 菜品/订单/成员管理 |

## ✨ 功能特性

### 小程序端（微信小程序）
- ✅ **菜单浏览** — 按分类展示菜品，支持图片、价格、描述
- ✅ **购物车** — 加入/修改数量/清空，底部悬浮
- ✅ **一键下单** — 填写备注，提交订单
- ✅ **订单跟踪** — 实时查看订单状态（待处理→制作中→已完成）
- ✅ **个人中心** — 消费统计，角色标识
- ✅ **管理后台（小程序内嵌）** — 大厨/管理员可直接在小程序中管理订单和菜品

### Web 管理后台（Vue 3 + Element Plus）
- ✅ **数据概览** — 成员消费排行、订单统计
- ✅ **菜品管理** — 增删改查、上下架切换
- ✅ **分类管理** — 管理菜品分类
- ✅ **订单管理** — 状态流转（待处理→制作中→已完成）
- ✅ **成员管理** — 角色分配（成员/大厨/管理员）

### 后端 API（Node.js + Express）
- ✅ RESTful API 设计
- ✅ JWT 认证
- ✅ SQLite 数据库（零配置，开箱即用）
- ✅ 文件上传支持
- ✅ Docker 一键部署

## 🏗️ 项目结构

```
family-order/
├── server/                  # 后端 API (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── index.ts         # 入口文件
│   │   ├── db.ts            # 数据库初始化
│   │   ├── init-db.ts       # 默认数据
│   │   ├── middleware/
│   │   │   └── auth.ts      # JWT 认证中间件
│   │   └── routes/
│   │       ├── auth.ts      # 登录认证
│   │       ├── dishes.ts    # 菜品 CRUD
│   │       ├── categories.ts # 分类 CRUD
│   │       ├── orders.ts    # 订单管理
│   │       ├── members.ts   # 成员管理
│   │       └── upload.ts    # 文件上传
│   └── package.json
├── miniapp/                 # 微信小程序
│   ├── pages/
│   │   ├── index/           # 点单首页
│   │   ├── orders/          # 订单列表
│   │   ├── order-detail/    # 订单详情
│   │   ├── profile/         # 个人中心
│   │   └── admin/           # 管理后台
│   └── utils/
│       └── api.js           # API 封装
├── admin/                   # Web 管理后台 (Vue 3 + Element Plus)
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   └── api/             # API 封装
│   └── package.json
├── docker-compose.yml       # Docker 一键部署
└── README.md
```

## 🚀 快速开始

### 方法一：本地开发

#### 1. 启动后端

```bash
cd server
npm install
npm run dev
```

后端运行在 http://localhost:3000

#### 2. 启动管理后台

```bash
cd admin
npm install
npm run dev
```

管理后台运行在 http://localhost:5173

#### 3. 打开小程序

1. 打开微信开发者工具
2. 导入 `miniapp/` 目录
3. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
4. 编译运行

### 方法二：Docker 部署

```bash
docker-compose up -d
```

### 方法三：生产部署

```bash
# 构建后端
cd server
npm install
npm run build
npm start

# 构建管理后台
cd admin
npm install
npm run build
# 将 dist/ 部署到 Nginx

# 小程序
# 在微信开发者工具中上传代码
```

## 📱 小程序使用说明

### 首次使用
1. 打开小程序 → 输入昵称 → 点击"进入"
2. 首次登录自动创建账号，默认角色为"家庭成员"
3. 请联系管理员在 Web 后台为你分配角色

### 点单流程
```
浏览菜单 → 点击菜品加入购物车 → 查看购物车 → 填写备注 → 提交订单
```

### 订单状态
- ⏳ **待处理** — 已下单，等待大厨确认
- 👨‍🍳 **制作中** — 大厨正在做
- ✅ **已完成** — 可以吃了
- ❌ **已取消**

## 🔧 管理后台使用

访问 http://localhost:5173 ，输入昵称登录。

首次启动会自动创建默认数据：
- **管理员**：输入"管理员"登录
- **大厨**：输入"张大厨"登录
- **家庭码**：`family001`
- **18 道默认菜品**，6 个分类

### 角色权限

| 操作 | 成员 | 大厨 | 管理员 |
|------|------|------|--------|
| 浏览菜单 | ✅ | ✅ | ✅ |
| 下单 | ✅ | ✅ | ✅ |
| 查看订单 | ✅ | ✅ | ✅ |
| 制作/完成 | ❌ | ✅ | ✅ |
| 管理菜品 | ❌ | ❌ | ✅ |
| 管理成员 | ❌ | ❌ | ✅ |

## ⚙️ 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 后端端口 |
| `JWT_SECRET` | `family-order-secret-dev` | JWT 签名密钥（生产环境请修改） |

## 🧪 技术栈

| 层 | 技术 |
|---|------|
| 小程序 | 微信原生 |
| 管理后台 | Vue 3 + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| 部署 | Docker / Docker Compose |

## 📄 License

MIT

## 🤝 贡献

欢迎 Issue 和 PR！如果你觉得这个项目有用，请给个 ⭐️
