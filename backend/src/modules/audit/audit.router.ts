import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { getAuditLogsHandler } from './audit.controller';

const router = Router();
router.get('/', authenticate, requireRoles('ADMIN'), getAuditLogsHandler);
export default router;
