import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as deptController from './department.controller';
import { createDepartmentSchema, updateDepartmentSchema } from './department.schema';

const router = Router();

router.get('/', deptController.getDepartments);
router.get('/:id', deptController.getDepartmentById);
router.get('/:id/batches', deptController.getDepartmentBatches);

router.post('/', authenticate, requireRoles('ADMIN'), validate(createDepartmentSchema), deptController.createDepartment);
router.put('/:id', authenticate, requireRoles('ADMIN'), validate(updateDepartmentSchema), deptController.updateDepartment);
router.delete('/:id', authenticate, requireRoles('ADMIN'), deptController.deleteDepartment);
router.get('/:id/faculty', authenticate, requireRoles('COORDINATOR', 'ADMIN'), deptController.getDepartmentFaculty);

export default router;
