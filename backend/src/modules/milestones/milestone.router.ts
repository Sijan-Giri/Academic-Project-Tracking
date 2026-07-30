import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as schema from './milestone.schema';
import * as controller from './milestone.controller';

const router = Router();
router.use(authenticate);
router.get('/', controller.getMilestonesHandler);
router.get('/:id', controller.getMilestoneByIdHandler);
router.post('/', requireRoles('COORDINATOR', 'ADMIN', 'FACULTY'), validate(schema.createMilestoneSchema), controller.createMilestoneHandler);
router.put('/:id', requireRoles('COORDINATOR', 'ADMIN', 'FACULTY'), validate(schema.updateMilestoneSchema), controller.updateMilestoneHandler);
router.delete('/:id', requireRoles('ADMIN'), controller.deleteMilestoneHandler);
router.patch('/:id/status', requireRoles('COORDINATOR', 'FACULTY'), validate(schema.updateMilestoneStatusSchema), controller.updateMilestoneStatusHandler);
export default router;
