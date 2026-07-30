const fs = require('fs');
const path = require('path');

const baseDir = 'f:\\Academic-Project-Tracking-System\\backend\\src\\modules';
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const files = {
    'projects/project.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export const getProjects = async (filters: any, skip: number, take: number) => {
  return prisma.project.findMany({ where: filters, skip, take, include: { team: true } });
};

export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { team: true, milestones: true, evaluations: true, guideAssignment: { include: { facultyProfile: { include: { user: true } } } } }
  });
  if (!project) throw new NotFoundError('Project not found');
  return project;
};

export const createProject = async (data: any) => {
  return prisma.project.create({ data });
};`,
    'projects/project.controller.ts': `import { Request, Response } from 'express';
import * as ProjectService from './project.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getProjects = async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  const { skip, take } = paginate(Number(page), Number(limit));
  const filters: any = {};
  if (status) filters.status = status;
  const projects = await ProjectService.getProjects(filters, skip, take);
  sendSuccess(res, projects);
};

export const createProject = async (req: Request, res: Response) => {
  const project = await ProjectService.createProject(req.body);
  sendSuccess(res, project, 'Project created', 201);
};`,
    'projects/project.router.ts': `import { Router } from 'express';
import { getProjects, createProject } from './project.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', getProjects);
router.post('/', createProject);

export default router;`,

    'evaluations/evaluation.service.ts': `import prisma from '../../config/database';
import { NotFoundError, LockedError } from '../../shared/errors';

export const submitEvaluation = async (data: any) => {
  return prisma.evaluation.create({ data });
};

export const lockEvaluation = async (id: string, userId: string) => {
  const evaluation = await prisma.evaluation.findUnique({ where: { id } });
  if (!evaluation) throw new NotFoundError('Evaluation not found');
  if (evaluation.isLocked) throw new LockedError('Evaluation is already locked');

  return prisma.evaluation.update({
    where: { id },
    data: { isLocked: true, lockedAt: new Date(), lockedById: userId }
  });
};`,
    'evaluations/evaluation.controller.ts': `import { Request, Response } from 'express';
import * as EvalService from './evaluation.service';
import { sendSuccess } from '../../shared/utils';

export const lockEvaluation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const evaluation = await EvalService.lockEvaluation(id, userId);
  sendSuccess(res, evaluation, 'Evaluation locked successfully');
};`,
    'evaluations/evaluation.router.ts': `import { Router } from 'express';
import { lockEvaluation } from './evaluation.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.post('/:id/lock', requireRoles('ADMIN', 'COORDINATOR'), lockEvaluation);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content);
}
console.log('Other modules generated.');
