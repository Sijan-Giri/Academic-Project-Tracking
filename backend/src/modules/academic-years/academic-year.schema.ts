import { z } from 'zod';

export const createAcademicYearSchema = z.object({
  startYear: z.number().int().min(2000),
  endYear: z.number().int().min(2000),
}).refine(data => data.endYear > data.startYear, {
  message: 'endYear must be greater than startYear',
  path: ['endYear'],
});

export const updateAcademicYearSchema = createAcademicYearSchema.partial();
