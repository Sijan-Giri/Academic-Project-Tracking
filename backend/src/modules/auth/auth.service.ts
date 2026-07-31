import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, NotFoundError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';
import { Role } from '@prisma/client';
import { env } from '../../config/env';

export const authService = {
  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await createAuditLog({ userId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id, newValue: { ipAddress, userAgent }, ipAddress, userAgent });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) throw new UnauthorizedError('User not found');
      
      const accessToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
      return accessToken;
    } catch (e) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: { include: { batch: true } },
        facultyProfile: { include: { department: true } }
      }
    });
    if (!user) throw new NotFoundError('User not found');
    const { password, ...rest } = user;
    return rest;
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new UnauthorizedError('Old password incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  },

  async createUser(data: any) {
    const { role = Role.STUDENT, departmentId, batchId, studentId, facultyId, phone, designation, specialization, ...userData } = data;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role,
        studentProfile: role === Role.STUDENT ? {
          create: { studentId: studentId || `STU${Date.now().toString().slice(-6)}`, phone, batchId: batchId || 'seed-batch-cse' }
        } : undefined,
        facultyProfile: (role === Role.FACULTY || role === Role.COORDINATOR || role === Role.PANEL) ? {
          create: { facultyId: facultyId || `FAC${Date.now().toString().slice(-6)}`, phone, designation: designation || 'Assistant Professor', specialization, departmentId: departmentId || 'seed-dept-cse' }
        } : undefined
      }
    });

    await createAuditLog({ userId: user.id, action: 'CREATE', entityType: 'User', entityId: user.id, newValue: { email: user.email, role: user.role } });
    const { password, ...rest } = user;
    return rest;
  },

  async signup(data: any, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new UnauthorizedError('An account with this email address already exists');
    }

    const createdUser = await this.createUser(data);

    const accessToken = jwt.sign({ userId: createdUser.id, role: createdUser.role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: createdUser.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await createAuditLog({ userId: createdUser.id, action: 'SIGNUP', entityType: 'User', entityId: createdUser.id, newValue: { ipAddress, userAgent }, ipAddress, userAgent });

    return { user: createdUser, accessToken, refreshToken };
  },

  async bulkImportStudents(rows: any[], batchId: string) {
    const results = { success: [] as string[], failed: [] as any[] };
    for (const row of rows) {
      try {
        const password = await bcrypt.hash(`${row.studentId}@Apts`, 10);
        await prisma.user.create({
          data: {
            name: row.name,
            email: row.email,
            password,
            role: Role.STUDENT,
            studentProfile: {
              create: { studentId: row.studentId, phone: row.phone, batchId }
            }
          }
        });
        results.success.push(row.email);
      } catch (err: any) {
        results.failed.push({ email: row.email, reason: err.message });
      }
    }
    return results;
  },

  async bulkImportFaculty(rows: any[], departmentId: string) {
    const results = { success: [] as string[], failed: [] as any[] };
    for (const row of rows) {
      try {
        const password = await bcrypt.hash('Faculty@123', 10);
        await prisma.user.create({
          data: {
            name: row.name,
            email: row.email,
            password,
            role: Role.FACULTY,
            facultyProfile: {
              create: { facultyId: row.facultyId, phone: row.phone, designation: row.designation, specialization: row.specialization, departmentId }
            }
          }
        });
        results.success.push(row.email);
      } catch (err: any) {
        results.failed.push({ email: row.email, reason: err.message });
      }
    }
    return results;
  }
};