import prisma from '../../config/database';

export const getSemesters = async (batchId?: string) => {
  return prisma.semester.findMany({
    where: {
      isActive: true,
      ...(batchId ? { batchId } : {}),
    },
    include: { batch: true },
    orderBy: [{ batchId: 'asc' }, { number: 'asc' }],
  });
};

export const getSemesterById = async (id: string) => {
  return prisma.semester.findUnique({
    where: { id },
    include: { batch: { include: { department: true } } },
  });
};

export const createSemester = async (data: any) => {
  return prisma.semester.create({ data });
};

export const updateSemester = async (id: string, data: any) => {
  return prisma.semester.update({
    where: { id },
    data,
  });
};

export const deleteSemester = async (id: string) => {
  return prisma.semester.update({
    where: { id },
    data: { isActive: false },
  });
};

export const setCurrentSemester = async (id: string) => {
  const semester = await prisma.semester.findUnique({ where: { id } });
  if (!semester) throw new Error('Semester not found');

  return prisma.$transaction(async (tx) => {
    await tx.semester.updateMany({
      where: { batchId: semester.batchId },
      data: { isCurrent: false },
    });
    return tx.semester.update({
      where: { id },
      data: { isCurrent: true },
    });
  });
};
