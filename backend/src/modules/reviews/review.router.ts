import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/templates', authenticate, reviewController.getTemplates);
router.post('/templates', authenticate, requireRoles('ADMIN'), reviewController.createTemplate);
router.put('/templates/:id', authenticate, requireRoles('ADMIN'), reviewController.updateTemplate);
router.delete('/templates/:id', authenticate, requireRoles('ADMIN'), reviewController.deleteTemplate);

router.get('/stages', authenticate, reviewController.getReviewStages);
router.post('/stages', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reviewController.createReviewStage);
router.get('/stages/:id', authenticate, reviewController.getReviewStageById);
router.put('/stages/:id', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reviewController.updateReviewStage);
router.delete('/stages/:id', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reviewController.deleteReviewStage);

router.get('/stages/:id/criteria', authenticate, reviewController.getStageCriteria);
router.post('/stages/:id/criteria', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reviewController.addCriteria);
router.put('/stages/:stageId/criteria/:criteriaId', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reviewController.updateCriteria);
router.delete('/stages/:stageId/criteria/:criteriaId', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reviewController.deleteCriteria);

export default router;
