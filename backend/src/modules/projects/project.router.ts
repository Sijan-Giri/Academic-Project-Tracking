import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as schema from './project.schema';
import * as controller from './project.controller';

const router = Router();
router.use(authenticate);
router.get('/my', requireRoles('STUDENT'), controller.getMyProjectsHandler);
router.get('/guided', requireRoles('FACULTY'), controller.getGuidedProjectsHandler);
router.post('/', requireRoles('STUDENT'), validate(schema.createProjectSchema), controller.createProjectHandler);
router.put('/:id', requireRoles('STUDENT'), validate(schema.updateProjectSchema), controller.updateProjectHandler);
router.post('/:id/submit-abstract', requireRoles('STUDENT'), controller.submitAbstractHandler);
router.post('/:id/review-abstract', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.reviewAbstractSchema), controller.reviewAbstractHandler);
router.delete('/:id', requireRoles('ADMIN'), controller.deleteProjectHandler);
router.get('/', controller.getProjectsHandler);
router.get('/:id', controller.getProjectByIdHandler);
export default router;