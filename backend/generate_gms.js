const fs = require('fs');
const path = require('path');

const baseDir = 'f:\\Academic-Project-Tracking-System\\backend\\src\\modules';
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const files = {
    'guides/guide.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';

export const submitPreferences = async (projectId: string, preferences: any[]) => {
  return Promise.all(preferences.map(p => prisma.guidePreference.create({ data: { projectId, facultyProfileId: p.facultyProfileId, rank: p.rank } })));
};

export const getPreferences = async (projectId: string) => prisma.guidePreference.findMany({ where: { projectId }, include: { facultyProfile: { include: { user: true } } } });

export const approvePreference = async (id: string, adminId: string) => {
  const pref = await prisma.guidePreference.findUnique({ where: { id } });
  if (!pref) throw new NotFoundError('Preference not found');
  
  await prisma.guidePreference.update({ where: { id }, data: { status: 'APPROVED', reviewedById: adminId, reviewedAt: new Date() } });
  const assignment = await prisma.guideAssignment.create({ data: { projectId: pref.projectId, facultyProfileId: pref.facultyProfileId, assignedById: adminId } });
  await createAuditLog({ action: 'CREATE', entityType: 'GuideAssignment', entityId: assignment.id, userId: adminId });
  return assignment;
};

export const getAvailableGuides = async () => prisma.facultyProfile.findMany({ include: { user: { select: { name: true, email: true } }, _count: { select: { guideAssignments: true } } } });
`,
    'guides/guide.controller.ts': `import { Request, Response } from 'express';
import * as GuideService from './guide.service';
import { sendSuccess } from '../../shared/utils';

export const submitPreferences = async (req: Request, res: Response) => sendSuccess(res, await GuideService.submitPreferences(req.body.projectId, req.body.preferences), 'Created', 201);
export const getPreferences = async (req: Request, res: Response) => sendSuccess(res, await GuideService.getPreferences(req.params.projectId));
export const approvePreference = async (req: Request, res: Response) => sendSuccess(res, await GuideService.approvePreference(req.params.id, (req as any).user.id));
export const getAvailable = async (req: Request, res: Response) => sendSuccess(res, await GuideService.getAvailableGuides());`,
    'guides/guide.router.ts': `import { Router } from 'express';
import * as Ctrl from './guide.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.post('/preferences', requireRoles('STUDENT'), Ctrl.submitPreferences);
router.get('/preferences/:projectId', requireRoles('ADMIN', 'COORDINATOR'), Ctrl.getPreferences);
router.patch('/preferences/:id/approve', requireRoles('ADMIN', 'COORDINATOR'), Ctrl.approvePreference);
router.get('/available', Ctrl.getAvailable);

export default router;`,

    'milestones/milestone.service.ts': `import prisma from '../../config/database';

export const getMilestones = async (filters: any) => prisma.milestone.findMany({ where: filters, orderBy: { deadline: 'asc' } });
export const getById = async (id: string) => prisma.milestone.findUnique({ where: { id } });
export const create = async (data: any) => prisma.milestone.create({ data });
export const updateStatus = async (id: string, status: any) => prisma.milestone.update({ where: { id }, data: { status } });`,
    'milestones/milestone.controller.ts': `import { Request, Response } from 'express';
import * as MS from './milestone.service';
import { sendSuccess } from '../../shared/utils';

export const getAll = async (req: Request, res: Response) => sendSuccess(res, await MS.getMilestones(req.query));
export const getById = async (req: Request, res: Response) => sendSuccess(res, await MS.getById(req.params.id));
export const create = async (req: Request, res: Response) => sendSuccess(res, await MS.create(req.body), 'Created', 201);
export const updateStatus = async (req: Request, res: Response) => sendSuccess(res, await MS.updateStatus(req.params.id, req.body.status));`,
    'milestones/milestone.router.ts': `import { Router } from 'express';
import * as Ctrl from './milestone.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', Ctrl.getAll);
router.get('/:id', Ctrl.getById);
router.post('/', requireRoles('ADMIN', 'COORDINATOR', 'FACULTY'), Ctrl.create);
router.patch('/:id/status', requireRoles('ADMIN', 'COORDINATOR', 'FACULTY'), Ctrl.updateStatus);

export default router;`,

    'submissions/submission.service.ts': `import prisma from '../../config/database';

export const createSubmission = async (data: any, files: any[], userId: string) => {
  const existing = await prisma.submission.findFirst({ where: { milestoneId: data.milestoneId }, orderBy: { version: 'desc' } });
  const version = existing ? existing.version + 1 : 1;
  
  return prisma.submission.create({
    data: {
      milestoneId: data.milestoneId,
      submittedById: userId,
      notes: data.notes,
      version,
      files: {
        create: files.map(f => ({ originalName: f.originalname, storagePath: f.path, mimeType: f.mimetype, sizeBytes: f.size, uploadedById: userId, projectId: data.projectId }))
      }
    },
    include: { files: true }
  });
};
export const getSubmissions = async (filters: any) => prisma.submission.findMany({ where: filters, include: { files: true } });`,
    'submissions/submission.controller.ts': `import { Request, Response } from 'express';
import * as SubService from './submission.service';
import { sendSuccess } from '../../shared/utils';

export const create = async (req: Request, res: Response) => sendSuccess(res, await SubService.createSubmission(req.body, req.files as any[], (req as any).user.id), 'Submitted', 201);
export const getAll = async (req: Request, res: Response) => sendSuccess(res, await SubService.getSubmissions(req.query));`,
    'submissions/submission.router.ts': `import { Router } from 'express';
import * as Ctrl from './submission.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { upload } from '../../config/multer';

const router = Router();
router.use(requireAuth);
router.post('/', upload.array('files'), Ctrl.create);
router.get('/', Ctrl.getAll);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content);
}
console.log('Guides, Milestones, Submissions generated.');
