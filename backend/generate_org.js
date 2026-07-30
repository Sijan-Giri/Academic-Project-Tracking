const fs = require('fs');
const path = require('path');

const baseDir = 'f:\\Academic-Project-Tracking-System\\backend\\src\\modules';
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const files = {
    'departments/department.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export const getDepartments = async (skip: number, take: number) => {
  return prisma.department.findMany({ skip, take, include: { _count: { select: { batches: true, facultyProfiles: true } } } });
};

export const getDepartmentById = async (id: string) => {
  const dept = await prisma.department.findUnique({ where: { id }, include: { batches: true } });
  if (!dept) throw new NotFoundError('Department not found');
  return dept;
};

export const createDepartment = async (data: any) => prisma.department.create({ data });
export const updateDepartment = async (id: string, data: any) => prisma.department.update({ where: { id }, data });
export const deleteDepartment = async (id: string) => prisma.department.update({ where: { id }, data: { isActive: false } });

export const getDepartmentFaculty = async (id: string) => prisma.facultyProfile.findMany({ where: { departmentId: id }, include: { user: { select: { id: true, name: true, email: true, role: true } } } });
export const getDepartmentBatches = async (id: string) => prisma.batch.findMany({ where: { departmentId: id } });`,

    'departments/department.controller.ts': `import { Request, Response } from 'express';
import * as DeptService from './department.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getAll = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const { skip, take } = paginate(Number(page), Number(limit));
  sendSuccess(res, await DeptService.getDepartments(skip, take));
};
export const getById = async (req: Request, res: Response) => sendSuccess(res, await DeptService.getDepartmentById(req.params.id));
export const create = async (req: Request, res: Response) => sendSuccess(res, await DeptService.createDepartment(req.body), 'Created', 201);
export const update = async (req: Request, res: Response) => sendSuccess(res, await DeptService.updateDepartment(req.params.id, req.body));
export const remove = async (req: Request, res: Response) => sendSuccess(res, await DeptService.deleteDepartment(req.params.id), 'Deleted');
export const getFaculty = async (req: Request, res: Response) => sendSuccess(res, await DeptService.getDepartmentFaculty(req.params.id));
export const getBatches = async (req: Request, res: Response) => sendSuccess(res, await DeptService.getDepartmentBatches(req.params.id));`,

    'departments/department.router.ts': `import { Router } from 'express';
import * as Ctrl from './department.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', Ctrl.getAll);
router.get('/:id', Ctrl.getById);
router.post('/', requireRoles('ADMIN'), Ctrl.create);
router.put('/:id', requireRoles('ADMIN'), Ctrl.update);
router.delete('/:id', requireRoles('ADMIN'), Ctrl.remove);
router.get('/:id/faculty', requireRoles('ADMIN', 'COORDINATOR'), Ctrl.getFaculty);
router.get('/:id/batches', Ctrl.getBatches);

export default router;`,

    'batches/batch.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export const getBatches = async (skip: number, take: number, departmentId?: string) => {
  const where = departmentId ? { departmentId } : {};
  return prisma.batch.findMany({ where, skip, take });
};

export const getBatchById = async (id: string) => {
  const batch = await prisma.batch.findUnique({ where: { id } });
  if (!batch) throw new NotFoundError('Batch not found');
  return batch;
};

export const createBatch = async (data: any) => prisma.batch.create({ data });
export const updateBatch = async (id: string, data: any) => prisma.batch.update({ where: { id }, data });
export const deleteBatch = async (id: string) => prisma.batch.update({ where: { id }, data: { isActive: false } });

export const getSemesters = async (id: string) => prisma.semester.findMany({ where: { batchId: id } });
export const getStudents = async (id: string) => prisma.studentProfile.findMany({ where: { batchId: id }, include: { user: { select: { id: true, name: true, email: true } } } });`,

    'batches/batch.controller.ts': `import { Request, Response } from 'express';
import * as BatchService from './batch.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getAll = async (req: Request, res: Response) => {
  const { page, limit, departmentId } = req.query;
  const { skip, take } = paginate(Number(page), Number(limit));
  sendSuccess(res, await BatchService.getBatches(skip, take, departmentId as string));
};
export const getById = async (req: Request, res: Response) => sendSuccess(res, await BatchService.getBatchById(req.params.id));
export const create = async (req: Request, res: Response) => sendSuccess(res, await BatchService.createBatch(req.body), 'Created', 201);
export const update = async (req: Request, res: Response) => sendSuccess(res, await BatchService.updateBatch(req.params.id, req.body));
export const remove = async (req: Request, res: Response) => sendSuccess(res, await BatchService.deleteBatch(req.params.id), 'Deleted');
export const getSemesters = async (req: Request, res: Response) => sendSuccess(res, await BatchService.getSemesters(req.params.id));
export const getStudents = async (req: Request, res: Response) => sendSuccess(res, await BatchService.getStudents(req.params.id));`,

    'batches/batch.router.ts': `import { Router } from 'express';
import * as Ctrl from './batch.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', Ctrl.getAll);
router.get('/:id', Ctrl.getById);
router.post('/', requireRoles('ADMIN'), Ctrl.create);
router.put('/:id', requireRoles('ADMIN'), Ctrl.update);
router.delete('/:id', requireRoles('ADMIN'), Ctrl.remove);
router.get('/:id/semesters', Ctrl.getSemesters);
router.get('/:id/students', Ctrl.getStudents);

export default router;`,

    'semesters/semester.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export const getSemesters = async (skip: number, take: number, batchId?: string) => {
  const where = batchId ? { batchId } : {};
  return prisma.semester.findMany({ where, skip, take });
};

export const getSemesterById = async (id: string) => {
  const sem = await prisma.semester.findUnique({ where: { id } });
  if (!sem) throw new NotFoundError('Semester not found');
  return sem;
};

export const createSemester = async (data: any) => prisma.semester.create({ data });
export const updateSemester = async (id: string, data: any) => prisma.semester.update({ where: { id }, data });
export const deleteSemester = async (id: string) => prisma.semester.update({ where: { id }, data: { isActive: false } });

export const setCurrentSemester = async (id: string) => {
  const sem = await getSemesterById(id);
  await prisma.semester.updateMany({ where: { batchId: sem.batchId }, data: { isCurrent: false } });
  return prisma.semester.update({ where: { id }, data: { isCurrent: true } });
};`,

    'semesters/semester.controller.ts': `import { Request, Response } from 'express';
import * as SemService from './semester.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getAll = async (req: Request, res: Response) => {
  const { page, limit, batchId } = req.query;
  const { skip, take } = paginate(Number(page), Number(limit));
  sendSuccess(res, await SemService.getSemesters(skip, take, batchId as string));
};
export const getById = async (req: Request, res: Response) => sendSuccess(res, await SemService.getSemesterById(req.params.id));
export const create = async (req: Request, res: Response) => sendSuccess(res, await SemService.createSemester(req.body), 'Created', 201);
export const update = async (req: Request, res: Response) => sendSuccess(res, await SemService.updateSemester(req.params.id, req.body));
export const remove = async (req: Request, res: Response) => sendSuccess(res, await SemService.deleteSemester(req.params.id), 'Deleted');
export const setCurrent = async (req: Request, res: Response) => sendSuccess(res, await SemService.setCurrentSemester(req.params.id), 'Set current');`,

    'semesters/semester.router.ts': `import { Router } from 'express';
import * as Ctrl from './semester.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', Ctrl.getAll);
router.get('/:id', Ctrl.getById);
router.post('/', requireRoles('ADMIN'), Ctrl.create);
router.put('/:id', requireRoles('ADMIN'), Ctrl.update);
router.delete('/:id', requireRoles('ADMIN'), Ctrl.remove);
router.put('/:id/set-current', requireRoles('ADMIN'), Ctrl.setCurrent);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content);
}
console.log('Departments, Batches, Semesters generated.');
