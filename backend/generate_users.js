const fs = require('fs');
const path = require('path');

const baseDir = 'f:\\Academic-Project-Tracking-System\\backend\\src\\modules';
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const files = {
    'academic-years/academic-year.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export const getAcademicYears = async (skip: number, take: number) => prisma.academicYear.findMany({ skip, take });
export const getById = async (id: string) => {
  const ay = await prisma.academicYear.findUnique({ where: { id } });
  if (!ay) throw new NotFoundError('Not found');
  return ay;
};
export const create = async (data: any) => prisma.academicYear.create({ data });
export const update = async (id: string, data: any) => prisma.academicYear.update({ where: { id }, data });
export const remove = async (id: string) => prisma.academicYear.update({ where: { id }, data: { isActive: false } });`,

    'academic-years/academic-year.controller.ts': `import { Request, Response } from 'express';
import * as AYService from './academic-year.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getAll = async (req: Request, res: Response) => {
  const { skip, take } = paginate(Number(req.query.page), Number(req.query.limit));
  sendSuccess(res, await AYService.getAcademicYears(skip, take));
};
export const getById = async (req: Request, res: Response) => sendSuccess(res, await AYService.getById(req.params.id));
export const create = async (req: Request, res: Response) => sendSuccess(res, await AYService.create(req.body), 'Created', 201);
export const update = async (req: Request, res: Response) => sendSuccess(res, await AYService.update(req.params.id, req.body));
export const remove = async (req: Request, res: Response) => sendSuccess(res, await AYService.remove(req.params.id), 'Deleted');`,

    'academic-years/academic-year.router.ts': `import { Router } from 'express';
import * as Ctrl from './academic-year.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', Ctrl.getAll);
router.get('/:id', Ctrl.getById);
router.post('/', requireRoles('ADMIN'), Ctrl.create);
router.put('/:id', requireRoles('ADMIN'), Ctrl.update);
router.delete('/:id', requireRoles('ADMIN'), Ctrl.remove);

export default router;`,

    'users/user.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';

export const getUsers = async (filters: any, skip: number, take: number) => {
  return prisma.user.findMany({
    where: filters, skip, take,
    select: { id: true, name: true, email: true, role: true, isActive: true, studentProfile: true, facultyProfile: true }
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isActive: true, studentProfile: true, facultyProfile: true }
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const updateUser = async (id: string, data: any, adminId: string) => {
  const user = await prisma.user.update({ where: { id }, data });
  await createAuditLog({ userId: adminId, action: 'UPDATE', entityType: 'User', entityId: id });
  return user;
};

export const changeStatus = async (id: string, isActive: boolean, adminId: string) => {
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  await createAuditLog({ userId: adminId, action: 'STATUS_CHANGE', entityType: 'User', entityId: id, newValue: { isActive } });
  return user;
};

export const getActivity = async (id: string, skip: number, take: number) => {
  return prisma.auditLog.findMany({ where: { userId: id }, skip, take, orderBy: { createdAt: 'desc' } });
};`,

    'users/user.controller.ts': `import { Request, Response } from 'express';
import * as UserService from './user.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getAll = async (req: Request, res: Response) => {
  const { page, limit, role, search } = req.query;
  const { skip, take } = paginate(Number(page), Number(limit));
  const filters: any = {};
  if (role) filters.role = role;
  if (search) filters.name = { contains: search, mode: 'insensitive' };
  sendSuccess(res, await UserService.getUsers(filters, skip, take));
};
export const getById = async (req: Request, res: Response) => sendSuccess(res, await UserService.getUserById(req.params.id));
export const update = async (req: Request, res: Response) => sendSuccess(res, await UserService.updateUser(req.params.id, req.body, (req as any).user.id));
export const remove = async (req: Request, res: Response) => sendSuccess(res, await UserService.changeStatus(req.params.id, false, (req as any).user.id));
export const activate = async (req: Request, res: Response) => sendSuccess(res, await UserService.changeStatus(req.params.id, true, (req as any).user.id));
export const deactivate = async (req: Request, res: Response) => sendSuccess(res, await UserService.changeStatus(req.params.id, false, (req as any).user.id));
export const getActivity = async (req: Request, res: Response) => {
  const { skip, take } = paginate(Number(req.query.page), Number(req.query.limit));
  sendSuccess(res, await UserService.getActivity(req.params.id, skip, take));
};`,

    'users/user.router.ts': `import { Router } from 'express';
import * as Ctrl from './user.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.use(requireRoles('ADMIN', 'COORDINATOR'));

router.get('/', Ctrl.getAll);
router.get('/:id', Ctrl.getById);
router.put('/:id', requireRoles('ADMIN'), Ctrl.update);
router.delete('/:id', requireRoles('ADMIN'), Ctrl.remove);
router.patch('/:id/activate', requireRoles('ADMIN'), Ctrl.activate);
router.patch('/:id/deactivate', requireRoles('ADMIN'), Ctrl.deactivate);
router.get('/:id/activity', Ctrl.getActivity);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content);
}
console.log('AY and Users generated.');
