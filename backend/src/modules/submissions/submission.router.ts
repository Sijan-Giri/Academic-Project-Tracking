import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import * as controller from './submission.controller';
import { Role } from '@prisma/client';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export const submissionsRouter = Router();
export const filesRouter = Router();

submissionsRouter.use(authenticate);
filesRouter.use(authenticate);

// Submissions
submissionsRouter.post('/', requireRoles('STUDENT'), upload.array('files', 5), controller.createSubmissionHandler);
submissionsRouter.get('/', controller.getSubmissionsHandler);
submissionsRouter.get('/:id', controller.getSubmissionHandler);

// Files
filesRouter.get('/:id/download', controller.downloadFileHandler);
filesRouter.delete('/:id', controller.deleteFileHandler);
