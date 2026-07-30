import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/department-summary', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reportController.deptSummaryReport);
router.get('/project-status', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reportController.projectStatusReport);
router.get('/defaulters', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reportController.defaultersReport);
router.get('/evaluation-marks', authenticate, requireRoles('COORDINATOR', 'ADMIN'), reportController.evaluationMarksReport);
router.get('/audit-log', authenticate, requireRoles('ADMIN'), reportController.auditLogReport);

export default router;
