import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { requireAuth, requireChef, requireAdmin } from '../middleware/auth.js';

const router = Router();

function generateOrderNo(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${date}${rand}`;
}

/**
 * POST /api/orders
 * 创建订单
 */
router.post('/', requireAuth, (req: Request, res: Response) => {
  const { items, remark } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: '请至少选择一道菜品' });
    return;
  }

  // 查询菜品价格，防止篡改
  let totalPrice = 0;
  const orderItems: any[] = [];
  for (const item of items) {
    const dish = db.prepare('SELECT * FROM dishes WHERE id = ? AND status = 1').get(item.dishId) as any;
    if (!dish) {
      res.status(400).json({ error: `菜品 ID ${item.dishId} 不存在或已下架` });
      return;
    }
    const quantity = Math.max(1, Math.floor(item.quantity || 1));
    const subtotal = Number((dish.price * quantity).toFixed(2));
    totalPrice += subtotal;
    orderItems.push({
      dish_id: dish.id,
      dish_name: dish.name,
      price: dish.price,
      quantity,
      subtotal,
    });
  }

  totalPrice = Number(totalPrice.toFixed(2));
  const orderNo = generateOrderNo();

  // 获取成员名
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.member!.memberId) as any;

  // 事务写入
  const createOrder = db.transaction(() => {
    const orderResult = db.prepare(
      'INSERT INTO orders (order_no, member_id, member_name, status, remark, total_price) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(orderNo, req.member!.memberId, member.nickname, 'pending', remark || '', totalPrice);

    const orderId = orderResult.lastInsertRowid as number;

    for (const item of orderItems) {
      db.prepare(
        'INSERT INTO order_items (order_id, dish_id, dish_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(orderId, item.dish_id, item.dish_name, item.price, item.quantity, item.subtotal);
    }

    return orderId;
  });

  const orderId = createOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

  res.json({ data: order });
});

/**
 * GET /api/orders
 * 获取订单列表
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
  const { status } = req.query;

  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  // 非管理员只能看自己的订单
  if (req.member!.role !== 'admin' && req.member!.role !== 'chef') {
    sql += ' AND member_id = ?';
    params.push(req.member!.memberId);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const orders = db.prepare(sql).all(...params) as any[];

  // 补充订单明细
  for (const order of orders) {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    (order as any).items = items;
  }

  res.json({ data: orders });
});

/**
 * GET /api/orders/:id
 * 获取订单详情
 */
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
  if (!order) {
    res.status(404).json({ error: '订单不存在' });
    return;
  }

  // 权限检查
  if (req.member!.role !== 'admin' && req.member!.role !== 'chef' && order.member_id !== req.member!.memberId) {
    res.status(403).json({ error: '无权查看此订单' });
    return;
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  order.items = items;

  res.json({ data: order });
});

/**
 * PUT /api/orders/:id/status
 * 更新订单状态（大厨/管理员）
 */
router.put('/:id/status', requireAuth, requireChef, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'cooking', 'done', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: '无效的状态值' });
    return;
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    res.status(404).json({ error: '订单不存在' });
    return;
  }

  db.prepare(
    'UPDATE orders SET status = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?'
  ).run(status, id);

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  (updated as any).items = items;

  res.json({ data: updated });
});

/**
 * DELETE /api/orders/:id
 * 删除订单（管理员）
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) {
    res.status(404).json({ error: '订单不存在' });
    return;
  }
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
