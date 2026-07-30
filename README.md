# 🎓 Academic Project Tracking System (APTS)

A full-stack, enterprise-grade system for managing final-year and semester-wise student projects from abstract submission through final evaluation.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 20, Express.js, TypeScript |
| **ORM** | Prisma 5 + PostgreSQL 16 |
| **Auth** | JWT (httpOnly cookies) + bcryptjs |
| **Validation** | Zod |
| **Files** | Multer (local disk) |
| **Email** | Nodemailer (console.log in dev, SMTP in prod) |
| **Reports** | PDFKit + ExcelJS |
| **Frontend** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS v3 |
| **UI** | shadcn/ui + Radix UI |
| **State** | Zustand (auth) + TanStack Query v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Routing** | React Router v6 |

---

## 📁 Project Structure

```
Academic-Project-Tracking-System/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Full 30-model DB schema
│   │   └── seed.ts              # Seed data (admin, depts, faculty, students)
│   ├── src/
│   │   ├── app.ts               # Express app + all routes mounted
│   │   ├── config/              # env, database, multer, mailer
│   │   ├── middleware/          # auth, rbac, validate, error
│   │   ├── shared/              # errors, types, utils
│   │   └── modules/
│   │       ├── auth/            # JWT login, register, bulk import
│   │       ├── departments/     # CRUD + faculty/batches
│   │       ├── academic-years/  # CRUD
│   │       ├── batches/         # CRUD + semesters/students
│   │       ├── semesters/       # CRUD + set current
│   │       ├── users/           # CRUD + activate/deactivate
│   │       ├── teams/           # Create, invite, approve/reject (coordinator)
│   │       ├── projects/        # CRUD + abstract submit/review lifecycle
│   │       ├── guides/          # Preferences + direct assignment
│   │       ├── milestones/      # CRUD + status updates
│   │       ├── submissions/     # File upload + versioning
│   │       ├── reviews/         # Templates + stages + criteria
│   │       ├── schedules/       # Review sessions + panel management
│   │       ├── evaluations/     # Marks entry + DB-level lock
│   │       ├── notifications/   # Real-time notifications + email
│   │       ├── announcements/   # Targeted announcements
│   │       ├── reports/         # PDF + Excel report generation
│   │       ├── settings/        # Key-value system settings
│   │       └── audit/           # Immutable audit trail
│   ├── uploads/                 # File storage (reports/, presentations/, source/)
│   ├── docker-compose.yml       # PostgreSQL 16 + pgAdmin
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── features/
    │   │   ├── auth/            # Login page
    │   │   ├── dashboard/       # Role-specific dashboards (4 roles)
    │   │   ├── admin/           # Departments, Users, Batches, Semesters,
    │   │   │                    # Academic Years, Review Templates, Settings, Audit
    │   │   ├── coordinator/     # Projects, Teams approval, Guide allocation,
    │   │   │                    # Review Stages, Schedules, Announcements
    │   │   ├── faculty/         # Guided Projects
    │   │   ├── evaluations/     # My Schedules + Evaluation Form
    │   │   ├── student/         # My Project, Team, Abstract, Milestones, Submissions
    │   │   ├── notifications/   # Notifications + Announcements
    │   │   ├── reports/         # Report downloads (PDF/Excel)
    │   │   └── profile/         # Profile + password change
    │   ├── components/
    │   │   ├── ui/              # 22 shadcn/ui components
    │   │   └── shared/          # DataTable, StatsCard, StatusBadge, etc.
    │   ├── layouts/             # AuthLayout, DashboardLayout, RoleGuard
    │   ├── api/                 # 16 typed API modules
    │   ├── store/               # Zustand auth store
    │   ├── types/               # TypeScript interfaces
    │   └── lib/                 # utils, constants, validators
    └── index.html
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)
- Git

### 2. Clone & Setup

```bash
cd f:\Academic-Project-Tracking-System
```

### 3. Start Database

```bash
cd backend
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on port `5432`
- **pgAdmin** on port `5050` (admin@apts.edu / admin123)

### 4. Configure Backend

```bash
copy .env.example .env
```

Edit `.env` — the defaults work with Docker out of the box.

### 5. Install & Setup Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Backend runs at **http://localhost:5000**

### 6. Install & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@apts.edu` | `Admin@123` |
| **Coordinator** | `coordinator.cse@apts.edu` | `Coord@123` |
| **Faculty** | `faculty1.cse@apts.edu` | `Faculty@123` |
| **Student** | `student1@apts.edu` | `Student@123` |

---

## 🗄️ Database Schema Overview

30 models across 5 domains:

```
Users & Profiles      → User, StudentProfile, FacultyProfile
Organization          → Department, AcademicYear, Batch, Semester
Teams & Projects      → Team, TeamMember, Project, GuideAssignment, GuidePreference
Review Pipeline       → ReviewStageTemplate, ReviewStage, ReviewSchedule, PanelAssignment,
                        EvaluationCriteria, Evaluation, EvaluationScore
Submissions           → Milestone, Submission, File
Communication         → Notification, Announcement
System                → Settings, AuditLog, CsvImportLog, PlagiarismReport
```

### 🔒 DB-Level Marks Lock

Evaluation rows are enforced at the database level via a PostgreSQL trigger:

```sql
-- Applied via `npx prisma db push` + manual migration:
CREATE OR REPLACE FUNCTION check_evaluation_locked()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."isLocked" = true THEN
    RAISE EXCEPTION 'Cannot update a locked evaluation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evaluation_lock_check
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION check_evaluation_locked();
```

Run this after `prisma db push`:
```bash
npx prisma db execute --stdin <<< "
CREATE OR REPLACE FUNCTION check_evaluation_locked() RETURNS TRIGGER AS \$\$
BEGIN
  IF OLD.\"isLocked\" = true THEN
    RAISE EXCEPTION 'Cannot update a locked evaluation';
  END IF;
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;
CREATE TRIGGER evaluation_lock_check BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION check_evaluation_locked();
"
```

---

## 👥 Role Access Matrix

| Feature | Admin | Coordinator | Faculty | Panel | Student |
|---|:---:|:---:|:---:|:---:|:---:|
| Department CRUD | ✅ | — | — | — | — |
| User Management | ✅ | — | — | — | — |
| Bulk Import (CSV) | ✅ | ✅ | — | — | — |
| Batch/Semester Setup | ✅ | — | — | — | — |
| Team Approval | ✅ | ✅ | — | — | — |
| Guide Allocation | ✅ | ✅ | — | — | — |
| Create Team | — | — | — | — | ✅ |
| Invite Members | — | — | — | — | ✅ (leader) |
| Submit Abstract | — | — | — | — | ✅ |
| Review Abstract | ✅ | ✅ | — | — | — |
| Milestone Management | ✅ | ✅ | ✅ | — | — |
| Submit Files | — | — | — | — | ✅ |
| Schedule Reviews | ✅ | ✅ | — | — | — |
| Enter Marks | — | — | ✅ | ✅ | — |
| Lock Marks | ✅ | ✅ | — | — | — |
| View Reports | ✅ | ✅ | — | — | — |
| Audit Log | ✅ | — | — | — | — |

---

## 📋 Project Lifecycle

```
DRAFT → ABSTRACT_SUBMITTED → ABSTRACT_APPROVED → IN_PROGRESS
     ↘ ABSTRACT_REJECTED ↗          ↓
                                UNDER_REVIEW → COMPLETED
                                      ↓
                                  CANCELLED
```

Review Stages (in order):
1. Abstract Review
2. Review 1
3. Review 2
4. Review 3
5. Pre-Submission
6. Final Submission

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`.

| Module | Base Path |
|---|---|
| Auth | `/api/auth` |
| Departments | `/api/departments` |
| Academic Years | `/api/academic-years` |
| Batches | `/api/batches` |
| Semesters | `/api/semesters` |
| Users | `/api/users` |
| Teams | `/api/teams` |
| Projects | `/api/projects` |
| Guide Allocation | `/api/guides` |
| Milestones | `/api/milestones` |
| Submissions | `/api/submissions` |
| Files | `/api/files` |
| Review Templates/Stages | `/api/reviews` |
| Schedules | `/api/schedules` |
| Evaluations | `/api/evaluations` |
| Notifications | `/api/notifications` |
| Announcements | `/api/announcements` |
| Reports | `/api/reports` |
| Settings | `/api/settings` |
| Audit Log | `/api/audit` |

---

## 📊 Reports Available

- **Department Summary** — project counts by status and domain
- **Project Status** — detailed per-project status report
- **Defaulters** — projects with overdue milestones
- **Evaluation Marks** — scores per project per review stage
- **Audit Log** — system activity export

All reports downloadable as **PDF** or **Excel (.xlsx)**.

---

## 🛠️ Development Commands

```bash
# Backend
npm run dev          # Start with hot-reload
npx prisma studio    # Open DB browser
npx prisma db push   # Sync schema
npm run seed         # Seed sample data

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 🔧 Environment Variables

See `backend/.env.example` for full list. Key variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/apts_db
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
CORSORIGIN=http://localhost:5173
NODE_ENV=development
```

For email (optional in dev — logs to console):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

---

## 🐛 Common Issues

**PostgreSQL not connecting**: Run `docker-compose up -d` from the `backend/` directory.

**Prisma client not generated**: Run `npx prisma generate` after installing packages.

**CORS errors**: Ensure `CORSORIGIN` in `.env` matches your frontend URL exactly.

**File upload fails**: The `uploads/` directory is created automatically. Ensure write permissions.
# Academic-Project-Tracking
