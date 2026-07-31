import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as schema from './project.schema';
import * as controller from './project.controller';

const router = Router();
router.use(authenticate);

// Student-specific named routes MUST come before /:id to avoid collision
router.get('/my', requireRoles('STUDENT'), controller.getMyProjectsHandler);           // /projects/my
router.get('/my-projects', requireRoles('STUDENT'), controller.getMyProjectsHandler);  // /projects/my-projects (frontend uses this)
router.get('/guided', requireRoles('FACULTY'), controller.getGuidedProjectsHandler);

router.post('/', requireRoles('STUDENT'), validate(schema.createProjectSchema), controller.createProjectHandler);
router.put('/:id', requireRoles('STUDENT'), validate(schema.updateProjectSchema), controller.updateProjectHandler);

// Abstract submission — frontend calls /projects/:id/abstract/submit and /projects/:id/submit-abstract
router.post('/:id/submit-abstract', requireRoles('STUDENT'), controller.submitAbstractHandler);
router.post('/:id/abstract/submit', requireRoles('STUDENT'), controller.submitAbstractHandler);

// Abstract review — frontend calls /projects/:id/abstract/review and /projects/:id/review-abstract
router.post('/:id/review-abstract', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.reviewAbstractSchema), controller.reviewAbstractHandler);
router.post('/:id/abstract/review', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.reviewAbstractSchema), controller.reviewAbstractHandler);

router.delete('/:id', requireRoles('ADMIN'), controller.deleteProjectHandler);
router.get('/', controller.getProjectsHandler);
router.get('/:id', controller.getProjectByIdHandler);

export default router;
