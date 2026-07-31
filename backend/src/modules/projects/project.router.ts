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
router.get('/my-projects', requireRoles('STUDENT'), controller.getMyProjectsHandler);  // /projects/my-projects
router.get('/guided', requireRoles('FACULTY'), controller.getGuidedProjectsHandler);

// Coordinator/Admin routes
router.get('/coordinator/projects', requireRoles('COORDINATOR', 'ADMIN'), controller.getProjectsHandler);

router.post('/', requireRoles('STUDENT'), validate(schema.createProjectSchema), controller.createProjectHandler);
router.put('/:id', requireRoles('STUDENT'), validate(schema.updateProjectSchema), controller.updateProjectHandler);

// Abstract submission
router.post('/:id/submit-abstract', requireRoles('STUDENT'), controller.submitAbstractHandler);
router.post('/:id/abstract/submit', requireRoles('STUDENT'), controller.submitAbstractHandler);

// Abstract review
router.post('/:id/review-abstract', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.reviewAbstractSchema), controller.reviewAbstractHandler);
router.post('/:id/abstract/review', requireRoles('COORDINATOR', 'ADMIN'), validate(schema.reviewAbstractSchema), controller.reviewAbstractHandler);

// Status change for Coordinator & Admin
router.patch('/:id/status', requireRoles('COORDINATOR', 'ADMIN'), controller.updateProjectStatusHandler);

router.delete('/:id', requireRoles('ADMIN'), controller.deleteProjectHandler);
router.get('/', controller.getProjectsHandler);
router.get('/:id', controller.getProjectByIdHandler);

export default router;
