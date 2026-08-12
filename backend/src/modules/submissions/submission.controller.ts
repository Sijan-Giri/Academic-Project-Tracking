import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as submissionService from './submission.service';

export const createSubmissionHandler = async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const submission = await submissionService.createSubmission(req.body, files || [], req.user!.userId);
  res.status(201).json(submission);
};

export const getSubmissionsHandler = async (req: AuthRequest, res: Response) => {
  const submissions = await submissionService.getSubmissions(
    {
      milestoneId: req.query.milestoneId as string,
      projectId: req.query.projectId as string,
    },
    req.user!.userId,
    req.user!.role
  );
  res.json(submissions);
};

export const getSubmissionHandler = async (req: AuthRequest, res: Response) => {
  const submission = await submissionService.getSubmissionById(req.params.id, req.user!.userId, req.user!.role);
  res.json(submission);
};

export const downloadFileHandler = async (req: AuthRequest, res: Response) => {
  const file = await submissionService.getFileStream(req.params.id, req.user!.userId, req.user!.role);
  const absPath = require('path').resolve(file.storagePath);
  res.download(absPath, file.originalName);
};

export const deleteFileHandler = async (req: AuthRequest, res: Response) => {
  const result = await submissionService.deleteFile(req.params.id, req.user!.userId, req.user!.role);
  res.json({ success: true, data: result });
};
