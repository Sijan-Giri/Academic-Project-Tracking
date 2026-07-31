import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { loginSchema, registerSchema, changePasswordSchema } from './auth.schema';

export const authController = {
  loginHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password, req.ip, req.headers['user-agent']);
      
      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      
      res.json({ user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken });
    } catch (error) {
      next(error);
    }
  },

  signupHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.signup(data, req.ip, req.headers['user-agent']);

      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

      res.status(201).json({ user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken });
    } catch (error) {
      next(error);
    }
  },

  logoutHandler: async (req: Request, res: Response) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(204).send();
  },

  refreshHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refresh_token || req.body.refreshToken;
      if (!token) return res.status(401).json({ message: 'No refresh token provided' });
      const accessToken = await authService.refreshAccessToken(token);
      res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  },

  getMeHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  changePasswordHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user!.userId, data.oldPassword, data.newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },

  registerHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  bulkImportStudentsHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new Error('CSV file is required');
      const csv = req.file.buffer.toString('utf-8');
      const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, h, i) => { obj[h] = values[i]; return obj; }, {});
      });

      const result = await authService.bulkImportStudents(rows, req.body.batchId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  bulkImportFacultyHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new Error('CSV file is required');
      const csv = req.file.buffer.toString('utf-8');
      const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, h, i) => { obj[h] = values[i]; return obj; }, {});
      });

      const result = await authService.bulkImportFaculty(rows, req.body.departmentId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
