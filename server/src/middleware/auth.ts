import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'family-order-secret-dev';

// JWT payload 类型
export interface JwtPayload {
  memberId: number;
  openid: string;
  role: string;
  familyCode: string;
}

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      member?: JwtPayload;
    }
  }
}

/** 生成 JWT Token */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** 验证 Token 中间件（可选：未登录也能访问） */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      req.member = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      // token 无效就当匿名用户
    }
  }
  next();
}

/** 必须登录中间件 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: '请先登录' });
    return;
  }
  try {
    req.member = jwt.verify(token, JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

/** 必须大厨或管理员 */
export function requireChef(req: Request, res: Response, next: NextFunction): void {
  if (!req.member || (req.member.role !== 'chef' && req.member.role !== 'admin')) {
    res.status(403).json({ error: '仅大厨和管理员可操作' });
    return;
  }
  next();
}

/** 必须管理员 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.member || req.member.role !== 'admin') {
    res.status(403).json({ error: '仅管理员可操作' });
    return;
  }
  next();
}
