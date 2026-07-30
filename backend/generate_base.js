const fs = require('fs');
const path = require('path');

const baseDir = 'f:\\Academic-Project-Tracking-System\\backend';
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const files = {
    'package.json': `{
  "name": "apts-backend",
  "version": "1.0.0",
  "main": "dist/app.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.14.0",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "exceljs": "^4.4.0",
    "express": "^4.19.2",
    "express-async-errors": "^3.1.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.13",
    "pdfkit": "^0.15.0",
    "uuid": "^9.0.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.15",
    "@types/node": "^20.14.0",
    "@types/pdfkit": "^0.13.4",
    "@types/uuid": "^9.0.8",
    "prisma": "^5.14.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.5"
  }
}`,
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "prisma/**/*"]
}`,
    'docker-compose.yml': `version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: apts_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@apts.edu
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - db
volumes:
  pgdata:`,
    '.env.example': `NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/apts_db
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORSORIGIN=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@apts.edu
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800`,
    '.gitignore': `node_modules
dist
.env
uploads/*
!uploads/.gitkeep
.DS_Store`,
    'uploads/.gitkeep': '',
    'src/config/env.ts': `import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORSORIGIN: z.string().default('http://localhost:5173'),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string(),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('52428800'),
});

export const env = envSchema.parse(process.env);`,
    'src/config/database.ts': `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;`,
    'src/config/multer.ts': `import multer from 'multer';
import path from 'path';
import { env } from './env';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'others';
    if (file.mimetype.includes('pdf')) folder = 'reports';
    else if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) folder = 'presentations';
    else if (file.mimetype.includes('zip')) folder = 'source';
    
    const dir = path.join(process.cwd(), env.UPLOAD_DIR, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (allowed.includes(file.mimetype) || file.mimetype.includes('csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});`,
    'src/config/mailer.ts': `import nodemailer from 'nodemailer';
import { env } from './env';

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: (env.SMTP_USER && env.SMTP_PASS) ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  } : undefined
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (env.NODE_ENV !== 'production') {
    console.log('--- EMAIL MOCK ---');
    console.log(\`To: \${to}\\nSubject: \${subject}\\nBody: \${html}\`);
    return;
  }
  return transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html
  });
};`,
    'src/shared/errors.ts': `export class AppError extends Error {
  constructor(public message: string, public statusCode: number, public code?: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundError extends AppError { constructor(msg = 'Resource not found') { super(msg, 404, 'NOT_FOUND'); } }
export class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized') { super(msg, 401, 'UNAUTHORIZED'); } }
export class ForbiddenError extends AppError { constructor(msg = 'Forbidden') { super(msg, 403, 'FORBIDDEN'); } }
export class ConflictError extends AppError { constructor(msg = 'Conflict') { super(msg, 409, 'CONFLICT'); } }
export class ValidationError extends AppError { constructor(msg = 'Validation failed') { super(msg, 422, 'VALIDATION'); } }
export class LockedError extends AppError { constructor(msg = 'Resource is locked') { super(msg, 423, 'LOCKED'); } }`,
    'src/shared/utils.ts': `import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Response } from 'express';

export const paginate = (page: number = 1, limit: number = 20) => {
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;
  return { take, skip };
};

export const sendSuccess = (res: Response, data: any, message = 'Success', status = 200) => {
  res.status(status).json({ success: true, message, data });
};

export const sendError = (res: Response, message: string, status = 500) => {
  res.status(status).json({ success: false, message });
};

export const generateToken = (payload: any, secret: string, expiresIn: string) => jwt.sign(payload, secret, { expiresIn });
export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);
`,
    'src/middleware/error.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.code, message: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(422).json({ success: false, error: 'VALIDATION', message: 'Validation failed', details: err.errors });
  }
  if (err.code && err.code.startsWith('P2')) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'CONFLICT', message: 'Resource already exists.' });
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Record not found.' });
  }
  res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' });
};`,
    'src/middleware/auth.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../shared/errors';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) throw new UnauthorizedError('Authentication required');
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};`,
    'src/middleware/rbac.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors';

export const requireRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    next();
  };
};`,
    'src/middleware/validate.ts': `import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};`,
    'src/app.ts': `import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: env.CORSORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes placeholder
app.get('/health', (req, res) => res.send('OK'));

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(\`Server listening on port \${env.PORT}\`);
});

export default app;`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content);
}

console.log('Base files generated.');
