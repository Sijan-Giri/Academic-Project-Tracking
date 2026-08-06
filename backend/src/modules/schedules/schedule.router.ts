import { Router } from 'express';
import { scheduleController } from './schedule.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/my-schedules', authenticate, scheduleController.getMySchedules);
router.get('/my', authenticate, scheduleController.getMySchedules);
router.get('/', authenticate, scheduleController.getSchedules);
router.post('/', authenticate, requireRoles('COORDINATOR', 'ADMIN'), scheduleController.createSchedule);
router.get('/:id', authenticate, scheduleController.getScheduleById);
router.put('/:id', authenticate, requireRoles('COORDINATOR', 'ADMIN'), scheduleController.updateSchedule);
router.delete('/:id', authenticate, requireRoles('COORDINATOR', 'ADMIN'), scheduleController.deleteSchedule);

router.post('/:id/panel', authenticate, requireRoles('COORDINATOR', 'ADMIN'), scheduleController.addPanelMember);
router.delete('/:id/panel/:facultyProfileId', authenticate, requireRoles('COORDINATOR', 'ADMIN'), scheduleController.removePanelMember);
router.patch('/:id/attendance', authenticate, requireRoles('PANEL', 'FACULTY'), scheduleController.markAttendance);
router.patch('/:id/complete', authenticate, requireRoles('COORDINATOR', 'ADMIN'), scheduleController.completeSchedule);

export default router;
