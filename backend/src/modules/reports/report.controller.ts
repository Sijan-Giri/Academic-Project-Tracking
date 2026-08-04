import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';
import prisma from '../../config/database';

export const reportController = {
  deptSummaryReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format = 'pdf', semesterId, departmentId } = req.query;
      const data = await reportService.getDeptSummaryData(semesterId as string, departmentId as string);
      
      const headers = ['Metric', 'Count'];
      const rows: (string | number)[][] = [
        ['Total Projects', data.totalProjects.toString()],
        ['Guides Assigned', data.guideAssigned.toString()],
      ];
      Object.entries(data.byStatus).forEach(([k, v]) => rows.push([`Status: ${k}`, v.toString()]));
      Object.entries(data.byDomain).forEach(([k, v]) => rows.push([`Domain: ${k}`, v.toString()]));

      if (format === 'excel') {
        const buffer = await reportService.generateExcel('Department Summary', headers, rows);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=summary.xlsx');
        return res.send(buffer);
      }
      
      const buffer = await reportService.generatePDF('Department Summary', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=summary.pdf');
      res.send(buffer);
    } catch (error) { next(error); }
  },

  projectStatusReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format = 'pdf' } = req.query;
      const data = await reportService.getProjectStatusData(req.query);
      const headers = ['Project Title', 'Status', 'Domain', 'Guide'];
      const rows = data.map(p => [p.title, p.status, p.domain || 'N/A', (p as any).guideAssignment?.facultyProfile?.user?.name || 'Unassigned']);

      if (format === 'excel') {
        const buffer = await reportService.generateExcel('Project Status', headers, rows);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=status.xlsx');
        return res.send(buffer);
      }

      const buffer = await reportService.generatePDF('Project Status', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=status.pdf');
      res.send(buffer);
    } catch (error) { next(error); }
  },

  defaultersReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format = 'pdf', semesterId, departmentId } = req.query;
      const data = await reportService.getDefaultersData(semesterId as string, departmentId as string);
      const headers = ['Project Title', 'Milestone', 'Deadline', 'Status'];
      const rows = data.map(m => [m.project?.title || 'Unknown', (m as any).name || (m as any).title || 'Milestone', m.deadline ? m.deadline.toISOString().split('T')[0] : 'N/A', m.status]);

      if (format === 'excel') {
        const buffer = await reportService.generateExcel('Defaulters', headers, rows);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=defaulters.xlsx');
        return res.send(buffer);
      }

      const buffer = await reportService.generatePDF('Defaulters', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=defaulters.pdf');
      res.send(buffer);
    } catch (error) { next(error); }
  },

  evaluationMarksReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format = 'pdf', semesterId, reviewStageId } = req.query;
      const data = await reportService.getEvaluationMarksData(semesterId as string, reviewStageId as string);
      const headers = ['Project Title', 'Stage', 'Marks', 'Grade'];
      const rows = data.map(e => [e.project?.title || 'Unknown', e.reviewStage?.name || 'Unknown', e.totalMarks != null ? e.totalMarks.toString() : '0', e.grade || 'N/A']);

      if (format === 'excel') {
        const buffer = await reportService.generateExcel('Evaluation Marks', headers, rows);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=marks.xlsx');
        return res.send(buffer);
      }

      const buffer = await reportService.generatePDF('Evaluation Marks', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=marks.pdf');
      res.send(buffer);
    } catch (error) { next(error); }
  },

  auditLogReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format = 'pdf' } = req.query;
      const data = await prisma.auditLog.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
      const headers = ['Action', 'Entity', 'Entity ID', 'User ID', 'Date'];
      const rows = data.map(a => [a.action, a.entityType, a.entityId, a.userId, a.createdAt.toISOString()]);

      if (format === 'excel') {
        const buffer = await reportService.generateExcel('Audit Log', headers, rows);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=audit.xlsx');
        return res.send(buffer);
      }

      const buffer = await reportService.generatePDF('Audit Log', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=audit.pdf');
      res.send(buffer);
    } catch (error) { next(error); }
  }
};
