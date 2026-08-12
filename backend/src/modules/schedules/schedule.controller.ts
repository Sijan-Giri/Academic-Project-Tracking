import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { scheduleService } from './schedule.service';
import { createScheduleSchema, updateScheduleSchema, addPanelSchema, attendanceSchema } from './schedule.schema';

export const scheduleController = {
  createSchedule: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = createScheduleSchema.parse(req.body);
      const schedule = await scheduleService.createSchedule(data, req.user!.userId);
      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  },

  getSchedules: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const schedules = await scheduleService.getSchedules(req.query as any);
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  },

  getScheduleById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const schedule = await scheduleService.getScheduleById(req.params.id);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  },

  updateSchedule: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateScheduleSchema.parse(req.body);
      const schedule = await scheduleService.updateSchedule(req.params.id, data);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  },

  deleteSchedule: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await scheduleService.deleteSchedule(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  addPanelMember: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { facultyProfileId } = addPanelSchema.parse(req.body);
      const assignment = await scheduleService.addPanelMember(req.params.id, facultyProfileId);
      res.status(201).json(assignment);
    } catch (error) {
      next(error);
    }
  },

  removePanelMember: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await scheduleService.removePanelMember(req.params.id, req.params.facultyProfileId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  markAttendance: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      
      const { isPresent } = attendanceSchema.parse(req.body);
      const { facultyProfileId } = req.body; 
      const assignment = await scheduleService.markAttendance(req.params.id, facultyProfileId, isPresent);
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  },

  completeSchedule: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const schedule = await scheduleService.completeSchedule(req.params.id, req.user!.userId);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  },

  getMySchedules: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const schedules = await scheduleService.getMySchedules(req.user!.userId);
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  },
};
