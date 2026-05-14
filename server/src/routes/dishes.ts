import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/dishes
 * 获取菜品列表（支持按分类筛选）
 */
router.get('/', (_req: Request, res: Response) => {
  const { categoryId, status } = _req.query;

  let sql = 'SELECT d.*, c.name as category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE 1=1';
  const params: any[] = [];

  if (categoryId) {
    sql += ' AND d.category_id = ?';
    params.push(Number(categoryId));
  }
  // 默认只返回上架的，除非显式传 status
  if (status !== undefined) {
    sql += ' AND d.status = ?';
    params.push(Number(status));
  } else {
    // 小程序端默认只看上架的
    if (_req.path === '/') {
      // do nothing, let all pass
    }
  }

  sql += ' ORDER BY d.sort_order ASC, d.id DESC';

  const dishes = db.prepare(sql).all(...params);
  res.json({ data: dishes });
});

/**
 * GET /api/dishes/available
 * 获取上架菜品（带分类信息，小程序用）
 */
router.get('/available', (_req: Request, res: Response) => {
  const categories = db.prepare(
    'SELECT * FROM categories ORDER BY sort_order ASC'
  ).all() as any[];

  const result: any[] = [];
  for (const cat of categories) {
    const dishes = db.prepare(
      'SELECT * FROM dishes WHERE category_id = ? AND status = 1 ORDER BY sort_order ASC'
    ).all(cat.id);
    if (dishes.length > 0) {
      result.push({
        ...cat,
        dishes,
      });
    }
  }
  res.json({ data: result });
});

/**
 * GET /api/dishes/:id
 * 获取单个菜品
 */
router.get('/:id', (req: Request, res: Response) => {
  const dish = db.prepare(
    'SELECT d.*, c.name as category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = ?'
  ).get(req.params.id);
  if (!dish) {
    res.status(404).json({ error: '菜品不存在' });
    return;
  }
  res.json({ data: dish });
});

/**
 * POST /api/dishes
 * 创建菜品（管理员）
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { categoryId, name, price, image, description, sortOrder } = req.body;

  if (!name || !price || !categoryId) {
    res.status(400).json({ error: '菜品名称、价格、分类不能为空' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO dishes (category_id, name, price, image, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(categoryId, name, price, image || '', description || '', sortOrder || 0);

  const dish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(result.lastInsertRowid);
  res.json({ data: dish });
});

/**
 * PUT /api/dishes/:id
 * 更新菜品
 */
router.put('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM dishes WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: '菜品不存在' });
    return;
  }

  const { categoryId, name, price, image, description, status, sortOrder } = req.body;

  db.prepare(
    'UPDATE dishes SET category_id=?, name=?, price=?, image=?, description=?, status=?, sort_order=?, updated_at=datetime(\'now\',\'localtime\') WHERE id=?'
  ).run(
    categoryId ?? existing.category_id,
    name ?? existing.name,
    price ?? existing.price,
    image !== undefined ? image : existing.image,
    description !== undefined ? description : existing.description,
    status !== undefined ? status : existing.status,
    sortOrder ?? existing.sort_order,
    id
  );

  const dish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(id);
  res.json({ data: dish });
});

/**
 * DELETE /api/dishes/:id
 * 删除菜品
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: '菜品不存在' });
    return;
  }
  db.prepare('DELETE FROM dishes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
