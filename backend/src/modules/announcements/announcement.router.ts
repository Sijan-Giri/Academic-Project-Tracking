import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as announcementController from './announcement.controller';
import { createAnnouncementSchema } from './announcement.schema';

const router = Router();

router.use(authenticate);

router.get('/', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.post('/', requireRoles('ADMIN', 'COORDINATOR'), validate(createAnnouncementSchema), announcementController.createAnnouncement);
router.delete('/:id', requireRoles('ADMIN', 'COORDINATOR'), announcementController.deleteAnnouncement);

export default router;
