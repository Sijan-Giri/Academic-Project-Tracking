import prisma from '../../config/database';
import { createAuditLog } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

export const getDepartments = async () => {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
};

export const getDepartmentById = async (id: string) => {
  return prisma.department.findUnique({
    where: { id },
    include: {
      facultyProfiles: { include: { user: true } },
      batches: true,
    },
  });
};

export const createDepartment = async (data: any, userId?: string) => {
  const dept = await prisma.department.create({ data });
  if (userId) {
    await createAuditLog({
      userId,
      action: AuditAction.CREATE,
      entityType: 'DEPARTMENT',
      entityId: dept.id,
      newValue: dept,
    });
  }
  return dept;
};

export const updateDepartment = async (id: string, data: any, userId?: string) => {
  const oldDept = await prisma.department.findUnique({ where: { id } });
  const newDept = await prisma.department.update({ where: { id }, data });
  if (userId) {
    await createAuditLog({
      userId,
      action: AuditAction.UPDATE,
      entityType: 'DEPARTMENT',
      entityId: newDept.id,
      oldValue: oldDept,
      newValue: newDept,
    });
  }
  return newDept;
};

export const deleteDepartment = async (id: string, userId?: string) => {
  const oldDept = await prisma.department.findUnique({ where: { id } });
  const newDept = await prisma.department.update({
    where: { id },
    data: { isActive: false },
  });
  if (userId) {
    await createAuditLog({
      userId,
      action: AuditAction.DELETE,
      entityType: 'DEPARTMENT',
      entityId: newDept.id,
      oldValue: oldDept,
      newValue: newDept,
    });
  }
  return newDept;
};

export const getDepartmentFaculty = async (id: string) => {
  return prisma.facultyProfile.findMany({
    where: { departmentId: id },
    include: { user: true },
  });
};

export const getDepartmentBatches = async (id: string) => {
  return prisma.batch.findMany({
    where: { departmentId: id, isActive: true },
    include: { academicYear: true },
  });
};
