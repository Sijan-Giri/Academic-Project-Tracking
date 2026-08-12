
export type ScheduleMode = 'ONLINE' | 'OFFLINE';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  hodId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AcademicYear {
  id: string;
  startYear: number;
  endYear: number;
  label: string;
  isActive: boolean;
  createdAt: string;
}

export interface Batch {
  id: string;
  departmentId: string;
  academicYearId: string;
  name: string;
  isActive: boolean;
  department?: Department;
  academicYear?: AcademicYear;
}

export interface Semester {
  id: string;
  batchId: string;
  number: number;
  name: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isCurrent: boolean;
  batch?: Batch;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
  user?: import('./user.types').User;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  description?: string;
}
