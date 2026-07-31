import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as semesterController from './semester.controller';
import { createSemesterSchema, updateSemesterSchema } from './semester.schema';

const router = Router();

router.use(authenticate);

router.get('/', semesterController.getSemesters);
router.get('/:id', semesterController.getSemesterById);
router.post('/', requireRoles('ADMIN'), validate(createSemesterSchema), semesterController.createSemester);
router.put('/:id', requireRoles('ADMIN'), validate(updateSemesterSchema), semesterController.updateSemester);
router.delete('/:id', requireRoles('ADMIN'), semesterController.deleteSemester);
router.put('/:id/set-current', requireRoles('ADMIN'), semesterController.setCurrentSemester);

export default router;
