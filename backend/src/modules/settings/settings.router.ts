import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import * as settingsController from './settings.controller';

const router = Router();

router.use(authenticate);

router.get('/public', settingsController.getPublicSettings);
router.get('/', requireRoles('ADMIN'), settingsController.getAllSettings);
router.put('/:key', requireRoles('ADMIN'), settingsController.updateSetting);

export default router;
