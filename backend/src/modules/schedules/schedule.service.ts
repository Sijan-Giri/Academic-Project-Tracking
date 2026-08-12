import prisma from '../../config/database';
import { AuditAction } from '@prisma/client';
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

    await createAuditLog({ action: AuditAction.CREATE, entityType: 'ReviewSchedule', entityId: schedule.id, userId: creatorId, newValue: JSON.stringify({ schedule }) });

    if (schedule.panelAssignments) {
      await Promise.all(
        schedule.panelAssignments
          .filter((a) => a.facultyProfile?.user?.id)
          .map((a) =>
            sendNotification(
              a.facultyProfile!.user!.id,
              'New Review Scheduled',
              `You have been assigned to a review panel for project presentation on ${new Date(schedule.scheduledAt).toLocaleString()}`,
              'DEADLINE_REMINDER'
            )
          )
      );
    }

    try {
      const teamMembers = await prisma.teamMember.findMany({
        where: { team: { project: { id: schedule.projectId } } },
        include: { studentProfile: { include: { user: true } } },
      });

      const scheduledDate = new Date(schedule.scheduledAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      await Promise.all(
        teamMembers
          .filter((m) => m.studentProfile?.user?.id)
          .map((m) =>
            sendNotification(
              m.studentProfile!.user!.id,
              'Presentation Schedule Published',
              `Your project presentation has been scheduled for ${scheduledDate} at ${schedule.venue || 'TBD'} (${schedule.mode}).`,
              'DEADLINE_REMINDER',
              schedule.projectId
            )
          )
      );
    } catch (err) {
      console.error('Failed to notify team members of schedule:', err);
    }

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
    await createAuditLog({ action: AuditAction.UPDATE, entityType: 'ReviewSchedule', entityId: scheduleId, userId, newValue: JSON.stringify({ action: 'complete' }) });
    return schedule;
  },

  async getMySchedules(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, facultyProfile: true },
    });

    if (!user) throw new NotFoundError('User not found');

    const scheduleInclude = {
      project: {
        include: {
          team: {
            include: {
              members: {
                include: {
                  studentProfile: {
                    include: { user: true },
                  },
                },
              },
            },
          },
          guideAssignment: {
            include: {
              facultyProfile: {
                include: { user: true },
              },
            },
          },
        },
      },
      reviewStage: true,
      panelAssignments: {
        include: {
          facultyProfile: {
            include: { user: true },
          },
        },
      },
    };

    if (user.role === 'ADMIN' || user.role === 'COORDINATOR') {
      return prisma.reviewSchedule.findMany({
        include: scheduleInclude,
        orderBy: { scheduledAt: 'desc' },
      });
    }

    if (user.role === 'STUDENT' && user.studentProfile) {
      return prisma.reviewSchedule.findMany({
        where: {
          project: {
            team: {
              members: {
                some: { studentProfileId: user.studentProfile.id },
              },
            },
          },
        },
        include: scheduleInclude,
        orderBy: { scheduledAt: 'desc' },
      });
    }

    if (user.facultyProfile) {
      return prisma.reviewSchedule.findMany({
        where: {
          OR: [
            { panelAssignments: { some: { facultyProfileId: user.facultyProfile.id } } },
            { project: { guideAssignment: { facultyProfileId: user.facultyProfile.id } } },
          ],
        },
        include: scheduleInclude,
        orderBy: { scheduledAt: 'desc' },
      });
    }

    return prisma.reviewSchedule.findMany({
      include: scheduleInclude,
      orderBy: { scheduledAt: 'desc' },
      take: 50,
    });
  }
};
