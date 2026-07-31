import prisma from '../../config/database';

export const getAcademicYears = async () => {
  return prisma.academicYear.findMany({
    orderBy: { startYear: 'desc' },
  });
};

export const getAcademicYearById = async (id: string) => {
  return prisma.academicYear.findUnique({
    where: { id },
  });
};

export const createAcademicYear = async (data: { startYear: number; endYear: number }) => {
  return prisma.academicYear.create({
    data: {
      ...data,
      label: `${data.startYear}-${data.endYear}`,
    },
  });
};

export const updateAcademicYear = async (id: string, data: { startYear?: number; endYear?: number }) => {
  const current = await prisma.academicYear.findUnique({ where: { id } });
  if (!current) throw new Error('Academic year not found');
  
  const startYear = data.startYear ?? current.startYear;
  const endYear = data.endYear ?? current.endYear;
  
  return prisma.academicYear.update({
    where: { id },
    data: {
      ...data,
      label: `${startYear}-${endYear}`,
    },
  });
};

export const deleteAcademicYear = async (id: string) => {
  return prisma.academicYear.delete({
    where: { id },
  });
};
