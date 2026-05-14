import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/members
 * 获取所有家庭成员
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
  const members = db.prepare(
    'SELECT id, nickname, avatar_url, role, family_code, is_active, created_at FROM members WHERE family_code = ? ORDER BY role ASC, created_at ASC'
  ).all(req.member!.familyCode);
  res.json({ data: members });
});

/**
 * PUT /api/members/:id/role
 * 修改成员角色（管理员）
 */
router.put('/:id/role', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['member', 'chef', 'admin'].includes(role)) {
    res.status(400).json({ error: '无效的角色' });
    return;
  }

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id) as any;
  if (!member) {
    res.status(404).json({ error: '成员不存在' });
    return;
  }

  db.prepare('UPDATE members SET role = ? WHERE id = ?').run(role, id);
  const updated = db.prepare('SELECT id, nickname, avatar_url, role, family_code, created_at FROM members WHERE id = ?').get(id);
  res.json({ data: updated });
});

/**
 * DELETE /api/members/:id
 * 移除成员（管理员）
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id) as any;
  if (!member) {
    res.status(404).json({ error: '成员不存在' });
    return;
  }
  if (member.role === 'admin') {
    res.status(400).json({ error: '不能移除管理员' });
    return;
  }
  db.prepare('DELETE FROM members WHERE id = ?').run(id);
  res.json({ success: true });
});

/**
 * GET /api/members/stats
 * 查看家庭成员的点单统计
 */
router.get('/stats', requireAuth, (req: Request, res: Response) => {
  const stats = db.prepare(`
    SELECT 
      m.id,
      m.nickname,
      m.avatar_url,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total_price), 0) as total_spent,
      COALESCE(SUM(CASE WHEN o.status = 'done' THEN 1 ELSE 0 END), 0) as completed_orders
    FROM members m
    LEFT JOIN orders o ON m.id = o.member_id
    WHERE m.family_code = ?
    GROUP BY m.id
    ORDER BY total_spent DESC
  `).all(req.member!.familyCode);
  res.json({ data: stats });
});

export default router;
