const fs = require('fs');
const path = require('path');

const baseDir = 'f:\\Academic-Project-Tracking-System\\backend\\src\\modules';
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const files = {
    'audit/audit.service.ts': `import prisma from '../../config/database';

export const createAuditLog = async (data: any) => {
  return prisma.auditLog.create({ data });
};

export const getAuditLogs = async (filters: any, skip: number, take: number) => {
  return prisma.auditLog.findMany({
    where: filters,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
};`,
    'audit/audit.controller.ts': `import { Request, Response } from 'express';
import * as AuditService from './audit.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getAuditLogs = async (req: Request, res: Response) => {
  const { page, limit, userId, action, entityType, entityId } = req.query;
  const { skip, take } = paginate(Number(page), Number(limit));
  
  const filters: any = {};
  if (userId) filters.userId = userId;
  if (action) filters.action = action;
  if (entityType) filters.entityType = entityType;
  if (entityId) filters.entityId = entityId;

  const logs = await AuditService.getAuditLogs(filters, skip, take);
  sendSuccess(res, logs);
};`,
    'audit/audit.router.ts': `import { Router } from 'express';
import { getAuditLogs } from './audit.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.use(requireRoles('ADMIN'));
router.get('/', getAuditLogs);

export default router;`,

    'auth/auth.schema.ts': `import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().email(), password: z.string() });
export const registerSchema = z.object({ email: z.string().email(), password: z.string(), name: z.string(), role: z.enum(['ADMIN', 'COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT']) });
export const changePasswordSchema = z.object({ oldPassword: z.string(), newPassword: z.string().min(6) });
`,
    'auth/auth.service.ts': `import prisma from '../../config/database';
import { comparePassword, generateToken, hashPassword } from '../../shared/utils';
import { UnauthorizedError, NotFoundError } from '../../shared/errors';
import { env } from '../../config/env';
import { createAuditLog } from '../audit/audit.service';

export const login = async (email: string, pass: string, ip?: string, ua?: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials or inactive user');
  
  const valid = await comparePassword(pass, user.password);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
  const refreshToken = generateToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);

  await createAuditLog({ userId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id, ipAddress: ip, userAgent: ua });
  return { user, accessToken, refreshToken };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true, facultyProfile: true } });
  if (!user) throw new NotFoundError('User not found');
  return user;
};`,
    'auth/auth.controller.ts': `import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import { sendSuccess } from '../../shared/utils';
import { env } from '../../config/env';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password, req.ip, req.headers['user-agent']);
  
  res.cookie('access_token', result.accessToken, { httpOnly: true, secure: env.NODE_ENV === 'production' });
  res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: env.NODE_ENV === 'production' });
  
  const { password: _, ...userWithoutPass } = result.user;
  sendSuccess(res, userWithoutPass, 'Logged in successfully');
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response) => {
  const user = await AuthService.getMe((req as any).user.id);
  const { password, ...safeUser } = user;
  sendSuccess(res, safeUser);
};`,
    'auth/auth.router.ts': `import { Router } from 'express';
import { login, logout, getMe } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema } from './auth.schema';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
router.post('/login', validate(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content);
}
console.log('Auth and Audit generated.');
