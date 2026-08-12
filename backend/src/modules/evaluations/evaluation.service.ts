import prisma from '../../config/database';
import { AuditAction } from '@prisma/client';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';
import { sendNotification } from '../notifications/notification.service';

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

export const evaluationService = {
  async submitEvaluation(data: any, userId: string) {
    const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Faculty profile not found');

    const existing = await prisma.evaluation.findFirst({
      where: { projectId: data.projectId, reviewStageId: data.reviewStageId, evaluatorId: profile.id }
    });

    const criteria = await prisma.evaluationCriteria.findMany({ where: { reviewStageId: data.reviewStageId } });
    let totalMarks = 0;
    let maxTotalMarks = 0;

    for (const score of data.scores) {
      const criterion = criteria.find(c => c.id === score.criteriaId);
      if (!criterion) throw new NotFoundError(`Criterion ${score.criteriaId} not found`);
      if (score.marks > criterion.maxMarks) throw new ConflictError(`Marks exceed max allowed for criterion ${criterion.name}`);
      totalMarks += Number(score.marks);
      maxTotalMarks += Number(criterion.maxMarks);
    }

    const percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;
    const grade = getGrade(percentage);

    const notifyEvaluationResults = async () => {
      try {
        const stage = await prisma.reviewStage.findUnique({ where: { id: data.reviewStageId } });
        const project = await prisma.project.findUnique({ where: { id: data.projectId } });
        const stageName = stage?.name || 'Review Stage';

        if (data.scheduleId) {
          await prisma.reviewSchedule.update({
            where: { id: data.scheduleId },
            data: { isCompleted: true }
          }).catch(() => {});
        } else {
          await prisma.reviewSchedule.updateMany({
            where: { projectId: data.projectId, reviewStageId: data.reviewStageId },
            data: { isCompleted: true }
          }).catch(() => {});
        }

        const teamMembers = await prisma.teamMember.findMany({
          where: { team: { project: { id: data.projectId } } },
          include: { studentProfile: { include: { user: true } } }
        });

        await Promise.all(
          teamMembers
            .filter((tm) => tm.studentProfile?.user?.id)
            .map((tm) =>
              sendNotification(
                tm.studentProfile!.user!.id,
                'Evaluation Results Published',
                `Your presentation for ${stageName} has been evaluated! Final Score: ${totalMarks} / ${maxTotalMarks} (${grade}).`,
                'FEEDBACK',
                data.projectId
              )
            )
        );

        const guideAssignment = await prisma.guideAssignment.findFirst({
          where: { projectId: data.projectId, isActive: true },
          include: { facultyProfile: { include: { user: true } } }
        });

        if (guideAssignment?.facultyProfile?.user?.id) {
          await sendNotification(
            guideAssignment.facultyProfile.user.id,
            'Project Evaluation Recorded',
            `Evaluation score of ${totalMarks} / ${maxTotalMarks} (${grade}) recorded for project "${project?.title || 'Project'}".`,
            'FEEDBACK',
            data.projectId
          );
        }
      } catch (err) {
        console.error('Failed to send evaluation notifications:', err);
      }
    };

    if (existing) {
      if (existing.isLocked) {
        throw new ForbiddenError('Evaluation is locked and cannot be modified');
      }
      await prisma.evaluationScore.deleteMany({ where: { evaluationId: existing.id } });
      const updated = await prisma.evaluation.update({
        where: { id: existing.id },
        data: {
          totalMarks,
          grade,
          feedback: data.feedback,
          scores: {
            create: data.scores.map((s: any) => ({
              criteriaId: s.criteriaId,
              marks: Number(s.marks),
              remarks: s.remarks,
            })),
          },
        },
        include: { scores: true },
      });
      await createAuditLog({ action: 'MARKS_ENTRY' as any, entityType: 'Evaluation', entityId: updated.id, userId, newValue: JSON.stringify({ totalMarks, grade }) });
      await notifyEvaluationResults();
      return updated;
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        projectId: data.projectId,
        reviewStageId: data.reviewStageId,
        evaluatorId: profile.id,
        totalMarks,
        grade,
        feedback: data.feedback,
        scores: {
          create: data.scores.map((s: any) => ({
            criteriaId: s.criteriaId,
            marks: Number(s.marks),
            remarks: s.remarks,
          }))
        }
      },
      include: { scores: true }
    });

    await createAuditLog({ action: 'MARKS_ENTRY' as any, entityType: 'Evaluation', entityId: evaluation.id, userId, newValue: JSON.stringify({ totalMarks, grade }) });
    await notifyEvaluationResults();
    return evaluation;
  },

  async getEvaluations(filters: { projectId?: string; reviewStageId?: string; evaluatorId?: string }) {
    return prisma.evaluation.findMany({
      where: filters,
      include: { evaluator: { include: { user: true } }, scores: { include: { criteria: true } } }
    });
  },

  async getEvaluationById(id: string) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { scores: { include: { criteria: true } }, evaluator: { include: { user: true } }, project: true }
    });
    if (!evaluation) throw new NotFoundError('Evaluation not found');
    return evaluation;
  },

  async updateEvaluation(id: string, data: any, userId: string) {
    const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
    const evaluation = await prisma.evaluation.findUnique({ where: { id }, include: { scores: true } });
    if (!evaluation) throw new NotFoundError('Evaluation not found');
    if (profile && evaluation.evaluatorId !== profile.id && evaluation.evaluatorId !== userId) {
      throw new ForbiddenError('Not authorized to update this evaluation');
    }
    if (evaluation.isLocked) throw new ConflictError('Evaluation is locked and cannot be updated');

    const criteria = await prisma.evaluationCriteria.findMany({ where: { reviewStageId: evaluation.reviewStageId } });
    
    let totalMarks = 0;
    let maxTotalMarks = 0;
    
    for (const c of criteria) maxTotalMarks += Number(c.maxMarks);

    const updatedScores = data.scores || [];
    for (const score of updatedScores) {
      await prisma.evaluationScore.upsert({
        where: { evaluationId_criteriaId: { evaluationId: id, criteriaId: score.criteriaId } },
        create: { evaluationId: id, criteriaId: score.criteriaId, marks: score.marks, remarks: score.remarks },
        update: { marks: score.marks, remarks: score.remarks }
      });
    }

    const currentScores = await prisma.evaluationScore.findMany({ where: { evaluationId: id } });
    currentScores.forEach(s => totalMarks += Number(s.marks));

    const percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;
    const grade = getGrade(percentage);

    const updated = await prisma.evaluation.update({
      where: { id },
      data: { totalMarks, grade, feedback: data.feedback ?? evaluation.feedback }
    });

    await createAuditLog({ action: AuditAction.MARKS_ENTRY, entityType: 'Evaluation', entityId: id, userId, newValue: JSON.stringify({ action: 'update', totalMarks, grade }) });
    return updated;
  },

  async lockEvaluation(id: string, userId: string) {
    const evaluation = await prisma.evaluation.findUnique({ where: { id }, include: { project: { include: { team: true } } } });
    if (!evaluation) throw new NotFoundError('Evaluation not found');
    if (evaluation.isLocked) throw new ConflictError('Evaluation already locked');

    const locked = await prisma.evaluation.update({
      where: { id },
      data: { isLocked: true, lockedAt: new Date(), lockedById: userId }
    });

    await createAuditLog({ action: AuditAction.MARKS_LOCK, entityType: 'Evaluation', entityId: id, userId });

    return locked;
  },

  async getProjectEvaluationSummary(projectId: string) {
    const evaluations = await prisma.evaluation.findMany({
      where: { projectId },
      include: { evaluator: true, reviewStage: true }
    });

    const summary: Record<string, any> = {};
    evaluations.forEach(ev => {
      if (!summary[ev.reviewStageId]) {
        summary[ev.reviewStageId] = {
          stageName: ev.reviewStage.name,
          evaluators: [],
          totalStageMarks: 0,
          averageMarks: 0
        };
      }
      summary[ev.reviewStageId].evaluators.push({
        evaluatorName: (ev.evaluator as any).user?.name || (ev.evaluator as any).name || 'Evaluator',
        marks: ev.totalMarks,
        grade: ev.grade
      });
      summary[ev.reviewStageId].totalStageMarks += Number(ev.totalMarks);
    });

    Object.keys(summary).forEach(key => {
      const stage = summary[key];
      stage.averageMarks = stage.totalStageMarks / stage.evaluators.length;
    });

    return summary;
  }
};
