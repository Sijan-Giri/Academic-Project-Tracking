import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { evaluationService } from './evaluation.service';
import { submitEvaluationSchema, updateEvaluationSchema } from './evaluation.schema';

export const evaluationController = {
  submitEvaluation: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = submitEvaluationSchema.parse(req.body);
      const evaluation = await evaluationService.submitEvaluation(data, req.user!.userId);
      res.status(201).json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  getEvaluations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters = {
        projectId: req.query.projectId as string,
        reviewStageId: req.query.reviewStageId as string,
        evaluatorId: req.query.evaluatorId as string,
      };
      const evaluations = await evaluationService.getEvaluations(filters);
      res.json(evaluations);
    } catch (error) {
      next(error);
    }
  },

  getEvaluationById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const evaluation = await evaluationService.getEvaluationById(req.params.id);
      res.json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  updateEvaluation: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateEvaluationSchema.parse(req.body);
      const evaluation = await evaluationService.updateEvaluation(req.params.id, data, req.user!.userId);
      res.json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  lockEvaluation: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const evaluation = await evaluationService.lockEvaluation(req.params.id, req.user!.userId);
      res.json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  getProjectEvaluationSummary: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const summary = await evaluationService.getProjectEvaluationSummary(req.params.projectId);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },
};
