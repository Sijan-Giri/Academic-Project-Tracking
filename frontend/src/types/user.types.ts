
import type { Batch } from './system.types';
import type { Department } from './system.types';

export type Role = 'ADMIN' | 'COORDINATOR' | 'FACULTY' | 'PANEL' | 'STUDENT';

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  batchId: string;
  currentSemesterId?: string;
  phone?: string;
  batch?: Batch;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  facultyId: string;
  departmentId: string;
  designation?: string;
  specialization?: string;
  phone?: string;
  department?: Department;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
}
