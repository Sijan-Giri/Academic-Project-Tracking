import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as schema from './team.schema';
import * as controller from './team.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Student routes
router.post('/', requireRoles('STUDENT'), validate(schema.createTeamSchema), controller.createTeamHandler);
router.get('/my', requireRoles('STUDENT'), controller.getMyTeamHandler);
router.put('/:id', requireRoles('STUDENT'), validate(schema.updateTeamSchema), controller.updateTeamHandler);
router.post('/:id/invite', requireRoles('STUDENT'), validate(schema.inviteMemberSchema), controller.inviteMemberHandler);
router.delete('/:id/members/:memberId', requireRoles('STUDENT'), controller.removeMemberHandler);
router.post('/:id/leave', requireRoles('STUDENT'), controller.leaveTeamHandler);

// Admin/Coordinator routes
router.get('/', requireRoles('ADMIN', 'COORDINATOR'), controller.getTeamsHandler);
router.patch('/:id/approve', requireRoles('ADMIN', 'COORDINATOR'), controller.approveTeamHandler);
router.patch('/:id/reject', requireRoles('ADMIN', 'COORDINATOR'), validate(schema.rejectTeamSchema), controller.rejectTeamHandler);

// Public (authenticated)
router.get('/:id', controller.getTeamHandler);

export default router;