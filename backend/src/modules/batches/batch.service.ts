import prisma from '../../config/database';

export const getBatches = async (departmentId?: string) => {
  return prisma.batch.findMany({
    where: {
      isActive: true,
      ...(departmentId ? { departmentId } : {}),
    },
    include: {
      department: true,
      academicYear: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getBatchById = async (id: string) => {
  return prisma.batch.findUnique({
    where: { id },
    include: {
      department: true,
      academicYear: true,
      semesters: { orderBy: { number: 'asc' } },
    },
  });
};

export const createBatch = async (data: any) => {
  return prisma.batch.create({ data });
};

export const updateBatch = async (id: string, data: any) => {
  return prisma.batch.update({
    where: { id },
    data,
  });
};

export const deleteBatch = async (id: string) => {
  return prisma.batch.update({
    where: { id },
    data: { isActive: false },
  });
};

export const getBatchSemesters = async (id: string) => {
  return prisma.semester.findMany({
    where: { batchId: id },
    orderBy: { number: 'asc' },
  });
};

export const getBatchStudents = async (id: string) => {
  return prisma.studentProfile.findMany({
    where: { batchId: id },
    include: { user: true },
  });
};