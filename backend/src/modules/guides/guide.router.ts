import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as schema from './guide.schema';
import * as controller from './guide.controller';

const router = Router();
router.use(authenticate);
router.get('/available', controller.getAvailableGuidesHandler);
router.get('/assignments', requireRoles('COORDINATOR', 'ADMIN'), controller.getGuideAssignmentsHandler);
router.post('/assign', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.assignGuideSchema), controller.assignGuideHandler);
router.delete('/assign/:id', requireRoles('COORDINATOR', 'ADMIN'), controller.removeGuideAssignmentHandler);

export default router;
