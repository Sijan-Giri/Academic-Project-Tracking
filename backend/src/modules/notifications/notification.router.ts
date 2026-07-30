import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as notificationController from './notification.controller';

const router = Router();

router.use(authenticate);

router.get('/my', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);
router.get('/unread-count', notificationController.getUnreadCount);

export default router;
