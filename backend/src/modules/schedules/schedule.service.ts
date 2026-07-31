import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';
import { sendNotification } from '../notifications/notification.service';

export const scheduleService = {
  async createSchedule(data: any, creatorId: string) {
    const { panelMemberIds, ...scheduleData } = data;
    const schedule = await prisma.reviewSchedule.create({
      data: {
        ...scheduleData,
        panelAssignments: panelMemberIds ? {
          create: panelMemberIds.map((id: string) => ({ facultyProfileId: id }))
        } : undefined
      },
      include: { panelAssignments: { include: { facultyProfile: { include: { user: true } } } }, project: { include: { team: true } } }
    });

    await createAuditLog({ action: 'CREATE' as any, entityType: 'ReviewSchedule', entityId: schedule.id, userId: creatorId, newValue: JSON.stringify({ schedule }) });

    // Send notifications to panel members
    if (schedule.panelAssignments) {
      for (const assignment of schedule.panelAssignments) {
        if (assignment.facultyProfile?.user?.id) {
          await sendNotification(
            assignment.facultyProfile.user.id,
            'New Review Scheduled',
            `You have been assigned to a review panel for project ${schedule.projectId}`,
            'GENERAL'
          );
        }
      }
    }

    // Project team notification (assuming logic exists in notification service or just skipping explicit team iteration if complex)
    return schedule;
  },

  async getSchedules(filters: { reviewStageId?: string; projectId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 10, startDate, endDate, ...rest } = filters;
    const skip = (page - 1) * limit;

    const where: any = { ...rest };
    if (startDate && endDate) {
      where.scheduledAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const [data, total] = await Promise.all([
      prisma.reviewSchedule.findMany({
        where,
        include: { project: { include: { team: true } }, reviewStage: true, panelAssignments: { include: { facultyProfile: { include: { user: true } } } } },
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'asc' }
      }),
      prisma.reviewSchedule.count({ where })
    ]);

    return { data, meta: { total, page, limit } };
  },

  async getScheduleById(id: string) {
    const schedule = await prisma.reviewSchedule.findUnique({
      where: { id },
      include: {
        project: true,
        reviewStage: { include: { criteria: true } },
        panelAssignments: { include: { facultyProfile: { include: { user: true } } } }
      }
    });
    if (!schedule) throw new NotFoundError('Schedule not found');
    return schedule;
  },

  async updateSchedule(id: string, data: any) {
    return prisma.reviewSchedule.update({
      where: { id },
      data
    });
  },

  async deleteSchedule(id: string) {
    return prisma.reviewSchedule.delete({ where: { id } });
  },

  async addPanelMember(scheduleId: string, facultyProfileId: string) {
    const assignment = await prisma.panelAssignment.create({
      data: { scheduleId, facultyProfileId },
      include: { facultyProfile: { include: { user: true } } }
    });

    if (assignment.facultyProfile?.user?.id) {
      await sendNotification(
        assignment.facultyProfile.user.id,
        'Added to Review Panel',
        'You have been added to a review schedule panel.',
        'GENERAL'
      );
    }
    return assignment;
  },

  async removePanelMember(scheduleId: string, facultyProfileId: string) {
    return prisma.panelAssignment.delete({
      where: { scheduleId_facultyProfileId: { scheduleId, facultyProfileId } }
    });
  },

  async markAttendance(scheduleId: string, facultyProfileId: string, isPresent: boolean) {
    return prisma.panelAssignment.update({
      where: { scheduleId_facultyProfileId: { scheduleId, facultyProfileId } },
      data: { isPresent }
    });
  },

  async completeSchedule(scheduleId: string, userId: string) {
    const schedule = await prisma.reviewSchedule.update({
      where: { id: scheduleId },
      data: { isCompleted: true }
    });
    await createAuditLog({ action: 'UPDATE' as any, entityType: 'ReviewSchedule', entityId: scheduleId, userId, newValue: JSON.stringify({ action: 'complete' }) });
    return schedule;
  },

  async getMySchedules(userId: string) {
    const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Faculty profile not found');

    return prisma.reviewSchedule.findMany({
      where: { panelAssignments: { some: { facultyProfileId: profile.id } } },
      include: { project: true, reviewStage: true },
      orderBy: { scheduledAt: 'desc' }
    });
  }
};
