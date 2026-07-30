import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as deptController from './department.controller';
import { createDepartmentSchema, updateDepartmentSchema } from './department.schema';

const router = Router();

router.use(authenticate);

router.get('/', deptController.getDepartments);
router.get('/:id', deptController.getDepartmentById);
router.post('/', requireRoles('ADMIN'), validate(createDepartmentSchema), deptController.createDepartment);
router.put('/:id', requireRoles('ADMIN'), validate(updateDepartmentSchema), deptController.updateDepartment);
router.delete('/:id', requireRoles('ADMIN'), deptController.deleteDepartment);
router.get('/:id/faculty', requireRoles('COORDINATOR', 'ADMIN'), deptController.getDepartmentFaculty);
router.get('/:id/batches', deptController.getDepartmentBatches);

export default router;