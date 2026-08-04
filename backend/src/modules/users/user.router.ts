import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as userController from './user.controller';
import { updateUserSchema } from './user.schema';

const router = Router();

router.use(authenticate);

// ── Named routes MUST come before /:id param to avoid route collision ─────
// Any authenticated user can update their own profile
router.put('/profile', userController.updateProfile);

router.get('/', requireRoles('ADMIN', 'COORDINATOR'), userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', requireRoles('ADMIN'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', requireRoles('ADMIN'), userController.deleteUser);
router.patch('/:id/activate', requireRoles('ADMIN'), userController.activateUser);
router.patch('/:id/deactivate', requireRoles('ADMIN'), userController.deactivateUser);
router.get('/:id/activity', requireRoles('ADMIN'), userController.getUserActivity);

export default router;
