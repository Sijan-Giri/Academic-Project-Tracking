import { Router } from 'express';
import multer from 'multer';
import { authController } from './auth.controller';
import { authenticate, requireRoles } from '../../shared/middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', authController.loginHandler);
router.post('/logout', authenticate, authController.logoutHandler);
router.post('/refresh', authController.refreshHandler);
router.get('/me', authenticate, authController.getMeHandler);
router.put('/change-password', authenticate, authController.changePasswordHandler);
router.post('/register', authenticate, requireRoles('ADMIN'), authController.registerHandler);
router.post('/bulk-import/students', authenticate, requireRoles('ADMIN', 'COORDINATOR'), upload.single('file'), authController.bulkImportStudentsHandler);
router.post('/bulk-import/faculty', authenticate, requireRoles('ADMIN'), upload.single('file'), authController.bulkImportFacultyHandler);

export default router;