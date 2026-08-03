import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as notificationController from './notification.controller';

const router = Router();

router.use(authenticate);

// Support both GET / and GET /my
router.get('/', notificationController.getMyNotifications);
router.get('/my', notificationController.getMyNotifications);

// Support both POST and PATCH for mark read / mark all read
router.post('/read-all', notificationController.markAllRead);
router.patch('/read-all', notificationController.markAllRead);

router.post('/:id/read', notificationController.markRead);
router.patch('/:id/read', notificationController.markRead);

router.get('/unread-count', notificationController.getUnreadCount);

export default router;
