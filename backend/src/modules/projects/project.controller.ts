import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as projectService from './project.service';

export const createProjectHandler = async (req: AuthRequest, res: Response) => {
  const project = await projectService.createProject(req.body, req.user!.userId);
  res.status(201).json(project);
};

export const getProjectsHandler = async (req: AuthRequest, res: Response) => {
  const { semesterId, departmentId, status, guideId, search, page, limit } = req.query;
  const result = await projectService.getProjects({
    semesterId, departmentId, status, guideId, search,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  res.json(result);
};

export const getProjectByIdHandler = async (req: AuthRequest, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  res.json(project);
};

export const updateProjectHandler = async (req: AuthRequest, res: Response) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user!.userId);
  res.json(project);
};

export const deleteProjectHandler = async (req: AuthRequest, res: Response) => {
  const result = await projectService.deleteProject(req.params.id);
  res.json(result);
};

export const submitAbstractHandler = async (req: AuthRequest, res: Response) => {
  const project = await projectService.submitAbstract(req.params.id, req.user!.userId);
  res.json(project);
};

export const reviewAbstractHandler = async (req: AuthRequest, res: Response) => {
  const project = await projectService.reviewAbstract(req.params.id, req.body, req.user!.userId);
  res.json(project);
};

export const getMyProjectsHandler = async (req: AuthRequest, res: Response) => {
  const projects = await projectService.getMyProjects(req.user!.userId);
  res.json(projects);
};

export const getGuidedProjectsHandler = async (req: AuthRequest, res: Response) => {
  const projects = await projectService.getGuidedProjects(req.user!.userId);
  res.json(projects);
};