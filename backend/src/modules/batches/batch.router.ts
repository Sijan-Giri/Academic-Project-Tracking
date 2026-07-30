import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as batchController from './batch.controller';
import { createBatchSchema, updateBatchSchema } from './batch.schema';

const router = Router();

router.use(authenticate);

router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatchById);
router.post('/', requireRoles('ADMIN'), validate(createBatchSchema), batchController.createBatch);
router.put('/:id', requireRoles('ADMIN'), validate(updateBatchSchema), batchController.updateBatch);
router.delete('/:id', requireRoles('ADMIN'), batchController.deleteBatch);
router.get('/:id/semesters', batchController.getBatchSemesters);
router.get('/:id/students', requireRoles('COORDINATOR', 'ADMIN'), batchController.getBatchStudents);

export default router;