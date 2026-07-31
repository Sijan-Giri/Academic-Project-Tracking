import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as academicYearController from './academic-year.controller';
import { createAcademicYearSchema, updateAcademicYearSchema } from './academic-year.schema';

const router = Router();

router.use(authenticate);

router.get('/', academicYearController.getAcademicYears);
router.get('/:id', academicYearController.getAcademicYearById);
router.post('/', requireRoles('ADMIN'), validate(createAcademicYearSchema), academicYearController.createAcademicYear);
router.put('/:id', requireRoles('ADMIN'), validate(updateAcademicYearSchema), academicYearController.updateAcademicYear);
router.delete('/:id', requireRoles('ADMIN'), academicYearController.deleteAcademicYear);

export default router;
