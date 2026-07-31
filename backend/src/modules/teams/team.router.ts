import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as schema from './team.schema';
import * as controller from './team.controller';

const router = Router();

router.use(authenticate);

// ── Named routes MUST come before /:id to avoid param collision ────────────
// Student: get own team
router.get('/my', requireRoles('STUDENT'), controller.getMyTeamHandler);
router.get('/my-team', requireRoles('STUDENT'), controller.getMyTeamHandler);

// Student: get own pending invitations
router.get('/invitations/my', requireRoles('STUDENT'), controller.getMyInvitationsHandler);
router.get('/my-invitations', requireRoles('STUDENT'), controller.getMyInvitationsHandler);

// Student: respond to a specific invitation
router.post('/invitations/:invitationId/accept', requireRoles('STUDENT'), controller.acceptInvitationHandler);
router.post('/invitations/:invitationId/decline', requireRoles('STUDENT'), controller.declineInvitationHandler);

// ── Admin / Coordinator routes ─────────────────────────────────────────────
router.get('/', requireRoles('ADMIN', 'COORDINATOR'), controller.getTeamsHandler);
router.patch('/:id/approve', requireRoles('ADMIN', 'COORDINATOR'), controller.approveTeamHandler);
router.post('/:id/approve', requireRoles('ADMIN', 'COORDINATOR'), controller.approveTeamHandler);
router.patch('/:id/reject', requireRoles('ADMIN', 'COORDINATOR'), validate(schema.rejectTeamSchema), controller.rejectTeamHandler);
router.post('/:id/reject', requireRoles('ADMIN', 'COORDINATOR'), validate(schema.rejectTeamSchema), controller.rejectTeamHandler);

// ── Team CRUD (Student) ────────────────────────────────────────────────────
router.post('/', requireRoles('STUDENT'), validate(schema.createTeamSchema), controller.createTeamHandler);
router.put('/:id', requireRoles('STUDENT'), validate(schema.updateTeamSchema), controller.updateTeamHandler);

// Student: invite a member → creates a PENDING invitation (no auto-join)
router.post('/:id/invite', requireRoles('STUDENT'), validate(schema.inviteMemberSchema), controller.inviteMemberHandler);
router.post('/:id/members/invite', requireRoles('STUDENT'), validate(schema.inviteMemberSchema), controller.inviteMemberHandler);

// Leader: view all invitations sent for a team
router.get('/:id/invitations', requireRoles('STUDENT'), controller.getTeamInvitationsHandler);

// Member management
router.delete('/:id/members/:memberId', requireRoles('STUDENT'), controller.removeMemberHandler);
router.post('/:id/leave', requireRoles('STUDENT'), controller.leaveTeamHandler);

// ── Generic team lookup (authenticated) ───────────────────────────────────
router.get('/:id', controller.getTeamHandler);

export default router;
