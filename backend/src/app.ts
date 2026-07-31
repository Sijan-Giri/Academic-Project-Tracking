import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

// Import all routers
import authRouter from './modules/auth/auth.router';
import auditRouter from './modules/audit/audit.router';
import departmentsRouter from './modules/departments/department.router';
import academicYearsRouter from './modules/academic-years/academic-year.router';
import batchesRouter from './modules/batches/batch.router';
import semestersRouter from './modules/semesters/semester.router';
import usersRouter from './modules/users/user.router';
import teamsRouter from './modules/teams/team.router';
import projectsRouter from './modules/projects/project.router';
import guidesRouter from './modules/guides/guide.router';
import milestonesRouter from './modules/milestones/milestone.router';
import { submissionsRouter, filesRouter } from './modules/submissions/submission.router';
import reviewsRouter from './modules/reviews/review.router';
import schedulesRouter from './modules/schedules/schedule.router';
import evaluationsRouter from './modules/evaluations/evaluation.router';
import notificationsRouter from './modules/notifications/notification.router';
import announcementsRouter from './modules/announcements/announcement.router';
import reportsRouter from './modules/reports/report.router';
import settingsRouter from './modules/settings/settings.router';

const app = express();

const allowedOrigins = (env.CORSORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      process.env.NODE_ENV === 'development' ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/academic-years', academicYearsRouter);
app.use('/api/batches', batchesRouter);
app.use('/api/semesters', semestersRouter);
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/guides', guidesRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/files', filesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit', auditRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`APTS Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;