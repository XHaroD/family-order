import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import dishesRoutes from './routes/dishes.js';
import categoriesRoutes from './routes/categories.js';
import ordersRoutes from './routes/orders.js';
import membersRoutes from './routes/members.js';
import uploadRoutes from './routes/upload.js';
import { initDefaultData } from './init-db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ============ 中间件 ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传的图片）
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// ============ 路由 ============
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ============ 启动 ============
async function start() {
  // 初始化默认数据
  await initDefaultData();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍽️ 家庭点单系统 API 运行在 http://localhost:${PORT}`);
    console.log(`📋 健康检查: http://localhost:${PORT}/api/health`);
  });
}

start().catch(console.error);
