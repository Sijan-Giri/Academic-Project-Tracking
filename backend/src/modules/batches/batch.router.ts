import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as batchController from './batch.controller';
import { createBatchSchema, updateBatchSchema } from './batch.schema';

const router = Router();

router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatchById);
router.get('/:id/semesters', batchController.getBatchSemesters);

router.post('/', authenticate, requireRoles('ADMIN'), validate(createBatchSchema), batchController.createBatch);
router.put('/:id', authenticate, requireRoles('ADMIN'), validate(updateBatchSchema), batchController.updateBatch);
router.delete('/:id', authenticate, requireRoles('ADMIN'), batchController.deleteBatch);
router.get('/:id/students', authenticate, requireRoles('COORDINATOR', 'ADMIN'), batchController.getBatchStudents);

export default router;
