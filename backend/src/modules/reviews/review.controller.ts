import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service';
import { createTemplateSchema, updateTemplateSchema, createReviewStageSchema, updateReviewStageSchema, createCriteriaSchema, updateCriteriaSchema } from './review.schema';

export const reviewController = {
  getTemplates: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await reviewService.getTemplates();
      res.json(templates);
    } catch (error) {
      next(error);
    }
  },

  getTemplateById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await reviewService.getTemplateById(req.params.id);
      res.json(template);
    } catch (error) {
      next(error);
    }
  },

  createTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createTemplateSchema.parse(req.body);
      const template = await reviewService.createTemplate(data, req.user!.userId);
      res.status(201).json(template);
    } catch (error) {
      next(error);
    }
  },

  updateTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateTemplateSchema.parse(req.body);
      const template = await reviewService.updateTemplate(req.params.id, data, req.user!.userId);
      res.json(template);
    } catch (error) {
      next(error);
    }
  },

  deleteTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await reviewService.deleteTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  getReviewStages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        semesterId: req.query.semesterId as string,
        departmentId: req.query.departmentId as string,
      };
      const stages = await reviewService.getReviewStages(filters);
      res.json(stages);
    } catch (error) {
      next(error);
    }
  },

  getReviewStageById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stage = await reviewService.getReviewStageById(req.params.id);
      res.json(stage);
    } catch (error) {
      next(error);
    }
  },

  createReviewStage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createReviewStageSchema.parse(req.body);
      const stage = await reviewService.createReviewStage(data);
      res.status(201).json(stage);
    } catch (error) {
      next(error);
    }
  },

  updateReviewStage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateReviewStageSchema.parse(req.body);
      const stage = await reviewService.updateReviewStage(req.params.id, data);
      res.json(stage);
    } catch (error) {
      next(error);
    }
  },

  deleteReviewStage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await reviewService.deleteReviewStage(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  getStageCriteria: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const criteria = await reviewService.getStageCriteria(req.params.id);
      res.json(criteria);
    } catch (error) {
      next(error);
    }
  },

  addCriteria: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createCriteriaSchema.parse(req.body);
      const criteria = await reviewService.addCriteria(req.params.id, data);
      res.status(201).json(criteria);
    } catch (error) {
      next(error);
    }
  },

  updateCriteria: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateCriteriaSchema.parse(req.body);
      const criteria = await reviewService.updateCriteria(req.params.stageId, req.params.criteriaId, data);
      res.json(criteria);
    } catch (error) {
      next(error);
    }
  },

  deleteCriteria: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await reviewService.deleteCriteria(req.params.stageId, req.params.criteriaId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
