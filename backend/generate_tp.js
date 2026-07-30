const fs = require('fs');
const path = require('path');

const baseDir = 'f:\\Academic-Project-Tracking-System\\backend\\src\\modules';
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const files = {
    'teams/team.service.ts': `import prisma from '../../config/database';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors';

export const createTeam = async (data: any, studentId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!profile) throw new NotFoundError('Student profile not found');
  
  return prisma.team.create({
    data: {
      name: data.name,
      semesterId: data.semesterId,
      members: { create: { studentProfileId: profile.id, isLeader: true } }
    }
  });
};

export const getMyTeam = async (studentId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!profile) return null;
  const member = await prisma.teamMember.findFirst({ where: { studentProfileId: profile.id }, include: { team: { include: { members: true, project: true } } } });
  return member?.team || null;
};

export const inviteMember = async (teamId: string, studentRoll: string) => {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (team?.status !== 'PENDING') throw new ForbiddenError('Team is not in PENDING state');
  
  const student = await prisma.studentProfile.findUnique({ where: { studentId: studentRoll } });
  if (!student) throw new NotFoundError('Student not found');
  
  return prisma.teamMember.create({ data: { teamId, studentProfileId: student.id } });
};

export const getTeams = async (filters: any, skip: number, take: number) => prisma.team.findMany({ where: filters, skip, take, include: { members: { include: { studentProfile: true } } } });
export const getTeamById = async (id: string) => prisma.team.findUnique({ where: { id }, include: { members: { include: { studentProfile: true } }, project: true } });
export const approveTeam = async (id: string, adminId: string) => prisma.team.update({ where: { id }, data: { status: 'APPROVED', approvedById: adminId, approvedAt: new Date() } });
export const rejectTeam = async (id: string, adminId: string, reason: string) => prisma.team.update({ where: { id }, data: { status: 'REJECTED', approvedById: adminId, approvedAt: new Date(), rejectionReason: reason } });
`,

    'teams/team.controller.ts': `import { Request, Response } from 'express';
import * as TeamService from './team.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const create = async (req: Request, res: Response) => sendSuccess(res, await TeamService.createTeam(req.body, (req as any).user.id), 'Created', 201);
export const getMy = async (req: Request, res: Response) => sendSuccess(res, await TeamService.getMyTeam((req as any).user.id));
export const invite = async (req: Request, res: Response) => sendSuccess(res, await TeamService.inviteMember(req.params.id, req.body.studentId));
export const getAll = async (req: Request, res: Response) => {
  const { skip, take } = paginate(Number(req.query.page), Number(req.query.limit));
  sendSuccess(res, await TeamService.getTeams(req.query, skip, take));
};
export const getById = async (req: Request, res: Response) => sendSuccess(res, await TeamService.getTeamById(req.params.id));
export const approve = async (req: Request, res: Response) => sendSuccess(res, await TeamService.approveTeam(req.params.id, (req as any).user.id));
export const reject = async (req: Request, res: Response) => sendSuccess(res, await TeamService.rejectTeam(req.params.id, (req as any).user.id, req.body.reason));`,

    'teams/team.router.ts': `import { Router } from 'express';
import * as Ctrl from './team.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.post('/', requireRoles('STUDENT'), Ctrl.create);
router.get('/my', requireRoles('STUDENT'), Ctrl.getMy);
router.post('/:id/invite', requireRoles('STUDENT'), Ctrl.invite);
router.get('/', requireRoles('ADMIN', 'COORDINATOR'), Ctrl.getAll);
router.get('/:id', Ctrl.getById);
router.patch('/:id/approve', requireRoles('ADMIN', 'COORDINATOR'), Ctrl.approve);
router.patch('/:id/reject', requireRoles('ADMIN', 'COORDINATOR'), Ctrl.reject);

export default router;`,

    'projects/project.service.ts': `import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';

export const getProjects = async (filters: any, skip: number, take: number) => {
  return prisma.project.findMany({ where: filters, skip, take, include: { team: true, guideAssignment: { include: { facultyProfile: { include: { user: true } } } } } });
};

export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { team: { include: { members: true } }, milestones: true, evaluations: true, guideAssignment: { include: { facultyProfile: { include: { user: true } } } } }
  });
  if (!project) throw new NotFoundError('Project not found');
  return project;
};

export const createProject = async (data: any) => prisma.project.create({ data });

export const submitAbstract = async (id: string) => {
  const p = await prisma.project.update({ where: { id }, data: { status: 'ABSTRACT_SUBMITTED' } });
  await createAuditLog({ action: 'STATUS_CHANGE', entityType: 'Project', entityId: id, newValue: { status: 'ABSTRACT_SUBMITTED' } });
  return p;
};

export const reviewAbstract = async (id: string, status: any, comments: string, adminId: string) => {
  const projectStatus = status === 'APPROVED' ? 'ABSTRACT_APPROVED' : status === 'REJECTED' ? 'ABSTRACT_REJECTED' : 'DRAFT';
  const p = await prisma.project.update({ where: { id }, data: { status: projectStatus } });
  await prisma.abstractReview.create({ data: { projectId: id, status, comments, reviewedById: adminId, version: 1 } });
  await createAuditLog({ action: 'STATUS_CHANGE', entityType: 'Project', entityId: id, newValue: { status: projectStatus } });
  return p;
};

export const getMyProjects = async (userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) return [];
  const members = await prisma.teamMember.findMany({ where: { studentProfileId: profile.id }, select: { teamId: true } });
  return prisma.project.findMany({ where: { teamId: { in: members.map(m => m.teamId) } } });
};

export const getGuidedProjects = async (userId: string) => {
  const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
  if (!profile) return [];
  const guides = await prisma.guideAssignment.findMany({ where: { facultyProfileId: profile.id }, select: { projectId: true } });
  return prisma.project.findMany({ where: { id: { in: guides.map(g => g.projectId) } } });
};`,

    'projects/project.controller.ts': `import { Request, Response } from 'express';
import * as ProjectService from './project.service';
import { sendSuccess, paginate } from '../../shared/utils';

export const getProjects = async (req: Request, res: Response) => {
  const { page, limit, status, semesterId } = req.query;
  const { skip, take } = paginate(Number(page), Number(limit));
  const filters: any = {};
  if (status) filters.status = status;
  if (semesterId) filters.semesterId = semesterId;
  sendSuccess(res, await ProjectService.getProjects(filters, skip, take));
};

export const getById = async (req: Request, res: Response) => sendSuccess(res, await ProjectService.getProjectById(req.params.id));
export const create = async (req: Request, res: Response) => sendSuccess(res, await ProjectService.createProject(req.body), 'Created', 201);
export const submitAbstract = async (req: Request, res: Response) => sendSuccess(res, await ProjectService.submitAbstract(req.params.id));
export const reviewAbstract = async (req: Request, res: Response) => sendSuccess(res, await ProjectService.reviewAbstract(req.params.id, req.body.status, req.body.comments, (req as any).user.id));
export const getMy = async (req: Request, res: Response) => sendSuccess(res, await ProjectService.getMyProjects((req as any).user.id));
export const getGuided = async (req: Request, res: Response) => sendSuccess(res, await ProjectService.getGuidedProjects((req as any).user.id));`,

    'projects/project.router.ts': `import { Router } from 'express';
import * as Ctrl from './project.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', Ctrl.getProjects);
router.post('/', requireRoles('STUDENT'), Ctrl.create);
router.get('/my', requireRoles('STUDENT'), Ctrl.getMy);
router.get('/guided', requireRoles('FACULTY'), Ctrl.getGuided);
router.get('/:id', Ctrl.getById);
router.post('/:id/submit-abstract', requireRoles('STUDENT'), Ctrl.submitAbstract);
router.post('/:id/review-abstract', requireRoles('ADMIN', 'COORDINATOR'), Ctrl.reviewAbstract);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content);
}
console.log('Teams and Projects generated.');
