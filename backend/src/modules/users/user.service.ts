import { Role } from '@prisma/client';
import prisma from '../../config/database';
import { hashPassword, exclude } from '../../shared/utils';
import { ConflictError } from '../../shared/errors';

export const getUsers = async (filters: { role?: Role; departmentId?: string; batchId?: string; search?: string; page?: number; limit?: number }) => {
  const { page = 1, limit = 20, role, departmentId, batchId, search } = filters;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (departmentId) {
    where.OR = [
      { studentProfile: { batch: { departmentId } } },
      { facultyProfile: { departmentId } },
    ];
  }
  if (batchId) {
    where.studentProfile = { batchId };
  }
  
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      include: {
        studentProfile: { include: { batch: true } },
        facultyProfile: { include: { department: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  
  return {
    items: items.map(user => exclude(user, ['password'])),
    total, page, limit, totalPages: Math.ceil(total / limit),
  };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: { include: { batch: true } },
      facultyProfile: { include: { department: true } },
    },
  });
  if (user) return exclude(user, ['password']);
  return null;
};

export const createUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new ConflictError('User with this email already exists');
  
  const hashedPassword = await hashPassword('Password@123');
  
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    if (data.role === Role.STUDENT && data.studentId && data.batchId) {
      await tx.studentProfile.create({
        data: {
          userId: user.id,
          studentId: data.studentId,
          batchId: data.batchId,
        },
      });
    } else if (data.role === Role.FACULTY && data.facultyId && data.departmentId) {
      await tx.facultyProfile.create({
        data: {
          userId: user.id,
          facultyId: data.facultyId,
          departmentId: data.departmentId,
          designation: data.designation || 'Faculty',
          specialization: data.specialization || '',
        },
      });
    }
    return exclude(user, ['password']);
  });
};

export const updateUser = async (id: string, data: any) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
    
    if (user.role === Role.FACULTY && (data.designation || data.specialization)) {
      await tx.facultyProfile.update({
        where: { userId: id },
        data: {
          designation: data.designation,
          specialization: data.specialization,
        },
      });
    }
    
    return exclude(user, ['password']);
  });
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  return exclude(user, ['password']);
};

export const activateUser = async (id: string) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: true },
  });
  return exclude(user, ['password']);
};

export const deactivateUser = async (id: string) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  return exclude(user, ['password']);
};

export const getUserActivity = async (id: string) => {
  return prisma.auditLog.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

export const bulkImportStudents = async (rows: any[], departmentId: string, batchId: string) => {
  const errors: string[] = [];
  let count = 0;
  const hashedPassword = await hashPassword('Password@123');

  for (const row of rows) {
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: row.name,
            email: row.email,
            password: hashedPassword,
            role: Role.STUDENT,
          },
        });
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentId: row.studentId,
            batchId,
          },
        });
      });
      count++;
    } catch (e: any) {
      errors.push(`Failed for ${row.email}: ${e.message}`);
    }
  }
  return { successCount: count, errors };
};

export const bulkImportFaculty = async (rows: any[], departmentId: string) => {
  const errors: string[] = [];
  let count = 0;
  const hashedPassword = await hashPassword('Password@123');

  for (const row of rows) {
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: row.name,
            email: row.email,
            password: hashedPassword,
            role: Role.FACULTY,
          },
        });
        await tx.facultyProfile.create({
          data: {
            userId: user.id,
            facultyId: row.facultyId,
            departmentId,
            designation: row.designation || 'Faculty',
            specialization: row.specialization || '',
          },
        });
      });
      count++;
    } catch (e: any) {
      errors.push(`Failed for ${row.email}: ${e.message}`);
    }
  }
  return { successCount: count, errors };
};