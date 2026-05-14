import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

/** 默认家庭码 */
const DEFAULT_FAMILY_CODE = 'family001';

/**
 * POST /api/auth/login
 * 微信登录（简化版：用昵称模拟 openid）
 * 真实场景请替换为 wx.login() 获取 code 后调用微信接口
 */
router.post('/login', (req: Request, res: Response) => {
  const { nickname, avatarUrl } = req.body;
  if (!nickname) {
    res.status(400).json({ error: '昵称不能为空' });
    return;
  }

  // 用昵称+时间戳模拟 openid（真实项目替换为微信 openid）
  const openid = `mock_${nickname}_${Date.now()}`;

  // 查找或创建成员
  let member = db.prepare('SELECT * FROM members WHERE nickname = ?').get(nickname) as any;
  if (!member) {
    const insert = db.prepare(
      'INSERT INTO members (openid, nickname, avatar_url, role, family_code) VALUES (?, ?, ?, ?, ?)'
    );
    const result = insert.run(openid, nickname, avatarUrl || '', 'member', DEFAULT_FAMILY_CODE);

    member = {
      id: result.lastInsertRowid,
      openid,
      nickname,
      avatar_url: avatarUrl || '',
      role: 'member',
      family_code: DEFAULT_FAMILY_CODE,
    };
  }

  const token = generateToken({
    memberId: member.id,
    openid: member.openid,
    role: member.role,
    familyCode: member.family_code,
  });

  res.json({
    token,
    member: {
      id: member.id,
      nickname: member.nickname,
      avatarUrl: member.avatar_url,
      role: member.role,
      familyCode: member.family_code,
    },
  });
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.member!.memberId) as any;
  if (!member) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  res.json({
    id: member.id,
    nickname: member.nickname,
    avatarUrl: member.avatar_url,
    role: member.role,
    familyCode: member.family_code,
  });
});

export default router;
