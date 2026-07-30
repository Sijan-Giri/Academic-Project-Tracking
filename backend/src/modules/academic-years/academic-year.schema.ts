import { z } from 'zod';

const academicYearBaseSchema = z.object({
  startYear: z.number().int().min(2000),
  endYear: z.number().int().min(2000),
});

export const createAcademicYearSchema = academicYearBaseSchema.refine(data => data.endYear > data.startYear, {
  message: 'endYear must be greater than startYear',
  path: ['endYear'],
});

export const updateAcademicYearSchema = academicYearBaseSchema.partial();
