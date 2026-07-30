import { Router } from 'express';
import { evaluationController } from './evaluation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', authenticate, evaluationController.getEvaluations);
router.post('/', authenticate, requireRoles('PANEL', 'FACULTY'), evaluationController.submitEvaluation);
router.get('/:id', authenticate, evaluationController.getEvaluationById);
router.put('/:id', authenticate, requireRoles('PANEL', 'FACULTY'), evaluationController.updateEvaluation);
router.post('/:id/lock', authenticate, requireRoles('COORDINATOR', 'ADMIN'), evaluationController.lockEvaluation);
router.get('/project/:projectId/summary', authenticate, evaluationController.getProjectEvaluationSummary);

export default router;