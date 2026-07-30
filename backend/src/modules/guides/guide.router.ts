import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as schema from './guide.schema';
import * as controller from './guide.controller';

const router = Router();
router.use(authenticate);
router.get('/available', controller.getAvailableGuidesHandler);
router.post('/preferences', requireRoles('STUDENT'), validate(schema.submitPreferencesSchema), controller.submitPreferencesHandler);
router.get('/preferences/:projectId', requireRoles('COORDINATOR', 'ADMIN', 'FACULTY'), controller.getGuidePreferencesHandler);
router.patch('/preferences/:id/approve', requireRoles('COORDINATOR', 'ADMIN'), controller.approvePreferenceHandler);
router.patch('/preferences/:id/reject', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.rejectPreferenceSchema), controller.rejectPreferenceHandler);
router.post('/assign', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.assignGuideSchema), controller.assignGuideHandler);
router.delete('/assign/:id', requireRoles('COORDINATOR', 'ADMIN'), controller.removeGuideAssignmentHandler);
export default router;
