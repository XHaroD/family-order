import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/categories
 * 获取所有分类
 */
router.get('/', (_req: Request, res: Response) => {
  const categories = db.prepare(
    'SELECT c.*, (SELECT COUNT(*) FROM dishes WHERE category_id = c.id AND status = 1) as dish_count FROM categories c ORDER BY c.sort_order ASC'
  ).all();
  res.json({ data: categories });
});

/**
 * POST /api/categories
 * 创建分类（管理员）
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { name, icon, sortOrder } = req.body;
  if (!name) {
    res.status(400).json({ error: '分类名称不能为空' });
    return;
  }
  const result = db.prepare(
    'INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)'
  ).run(name, icon || '🥘', sortOrder || 0);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.json({ data: category });
});

/**
 * PUT /api/categories/:id
 * 更新分类
 */
router.put('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, icon, sortOrder } = req.body;

  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: '分类不存在' });
    return;
  }

  db.prepare(
    'UPDATE categories SET name = ?, icon = ?, sort_order = ? WHERE id = ?'
  ).run(
    name || (existing as any).name,
    icon || (existing as any).icon,
    sortOrder !== undefined ? sortOrder : (existing as any).sort_order,
    id
  );

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json({ data: category });
});

/**
 * DELETE /api/categories/:id
 * 删除分类
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: '分类不存在' });
    return;
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
