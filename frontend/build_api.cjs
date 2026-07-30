const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const files = {
  'api/academic-years.api.ts': `import api from './client';
import { AcademicYear, ApiResponse } from '@/types';

export const getAcademicYears = async () => (await api.get<ApiResponse<AcademicYear[]>>('/academic-years')).data;
export const getAcademicYear = async (id: string) => (await api.get<ApiResponse<AcademicYear>>(\`/academic-years/\${id}\`)).data;
export const createAcademicYear = async (data: Partial<AcademicYear>) => (await api.post<ApiResponse<AcademicYear>>('/academic-years', data)).data;
export const updateAcademicYear = async (id: string, data: Partial<AcademicYear>) => (await api.put<ApiResponse<AcademicYear>>(\`/academic-years/\${id}\`, data)).data;
export const deleteAcademicYear = async (id: string) => (await api.delete<ApiResponse<void>>(\`/academic-years/\${id}\`)).data;
`,
  'api/batches.api.ts': `import api from './client';
import { Batch, Semester, User, ApiResponse, PaginatedResponse } from '@/types';

export const getBatches = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Batch>>>('/batches', { params })).data;
export const getBatch = async (id: string) => (await api.get<ApiResponse<Batch>>(\`/batches/\${id}\`)).data;
export const createBatch = async (data: Partial<Batch>) => (await api.post<ApiResponse<Batch>>('/batches', data)).data;
export const updateBatch = async (id: string, data: Partial<Batch>) => (await api.put<ApiResponse<Batch>>(\`/batches/\${id}\`, data)).data;
export const deleteBatch = async (id: string) => (await api.delete<ApiResponse<void>>(\`/batches/\${id}\`)).data;
export const getBatchSemesters = async (id: string) => (await api.get<ApiResponse<Semester[]>>(\`/batches/\${id}/semesters\`)).data;
export const getBatchStudents = async (id: string) => (await api.get<ApiResponse<User[]>>(\`/batches/\${id}/students\`)).data;
`,
  'api/semesters.api.ts': `import api from './client';
import { Semester, ApiResponse, PaginatedResponse } from '@/types';

export const getSemesters = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Semester>>>('/semesters', { params })).data;
export const getSemester = async (id: string) => (await api.get<ApiResponse<Semester>>(\`/semesters/\${id}\`)).data;
export const createSemester = async (data: Partial<Semester>) => (await api.post<ApiResponse<Semester>>('/semesters', data)).data;
export const updateSemester = async (id: string, data: Partial<Semester>) => (await api.put<ApiResponse<Semester>>(\`/semesters/\${id}\`, data)).data;
export const deleteSemester = async (id: string) => (await api.delete<ApiResponse<void>>(\`/semesters/\${id}\`)).data;
export const setCurrentSemester = async (id: string) => (await api.post<ApiResponse<Semester>>(\`/semesters/\${id}/set-current\`)).data;
`,
  'api/users.api.ts': `import api from './client';
import { User, ApiResponse, PaginatedResponse, AuditLog } from '@/types';

export const getUsers = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<User>>>('/users', { params })).data;
export const getUser = async (id: string) => (await api.get<ApiResponse<User>>(\`/users/\${id}\`)).data;
export const createUser = async (data: Partial<User>) => (await api.post<ApiResponse<User>>('/users', data)).data;
export const updateUser = async (id: string, data: Partial<User>) => (await api.put<ApiResponse<User>>(\`/users/\${id}\`, data)).data;
export const deleteUser = async (id: string) => (await api.delete<ApiResponse<void>>(\`/users/\${id}\`)).data;
export const activateUser = async (id: string) => (await api.post<ApiResponse<User>>(\`/users/\${id}/activate\`)).data;
export const deactivateUser = async (id: string) => (await api.post<ApiResponse<User>>(\`/users/\${id}/deactivate\`)).data;
export const getUserActivity = async (id: string) => (await api.get<ApiResponse<AuditLog[]>>(\`/users/\${id}/activity\`)).data;
export const bulkImportStudents = async (formData: FormData) => (await api.post<ApiResponse<any>>('/users/bulk-import/students', formData)).data;
export const bulkImportFaculty = async (formData: FormData) => (await api.post<ApiResponse<any>>('/users/bulk-import/faculty', formData)).data;
`,
  'api/teams.api.ts': `import api from './client';
import { Team, ApiResponse, PaginatedResponse } from '@/types';

export const createTeam = async (data: Partial<Team>) => (await api.post<ApiResponse<Team>>('/teams', data)).data;
export const getMyTeam = async () => (await api.get<ApiResponse<Team>>('/teams/my-team')).data;
export const getTeam = async (id: string) => (await api.get<ApiResponse<Team>>(\`/teams/\${id}\`)).data;
export const updateTeam = async (id: string, data: Partial<Team>) => (await api.put<ApiResponse<Team>>(\`/teams/\${id}\`, data)).data;
export const inviteMember = async (teamId: string, studentId: string) => (await api.post<ApiResponse<any>>(\`/teams/\${teamId}/members/invite\`, { studentId })).data;
export const removeMember = async (teamId: string, memberId: string) => (await api.delete<ApiResponse<any>>(\`/teams/\${teamId}/members/\${memberId}\`)).data;
export const leaveTeam = async (teamId: string) => (await api.post<ApiResponse<any>>(\`/teams/\${teamId}/leave\`)).data;
export const getTeams = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Team>>>('/teams', { params })).data;
export const approveTeam = async (id: string) => (await api.post<ApiResponse<Team>>(\`/teams/\${id}/approve\`)).data;
export const rejectTeam = async (id: string, reason: string) => (await api.post<ApiResponse<Team>>(\`/teams/\${id}/reject\`, { reason })).data;
`,
  'api/projects.api.ts': `import api from './client';
import { Project, ApiResponse, PaginatedResponse } from '@/types';

export const createProject = async (data: Partial<Project>) => (await api.post<ApiResponse<Project>>('/projects', data)).data;
export const getProjects = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Project>>>('/projects', { params })).data;
export const getProject = async (id: string) => (await api.get<ApiResponse<Project>>(\`/projects/\${id}\`)).data;
export const updateProject = async (id: string, data: Partial<Project>) => (await api.put<ApiResponse<Project>>(\`/projects/\${id}\`, data)).data;
export const deleteProject = async (id: string) => (await api.delete<ApiResponse<void>>(\`/projects/\${id}\`)).data;
export const submitAbstract = async (id: string) => (await api.post<ApiResponse<Project>>(\`/projects/\${id}/abstract/submit\`)).data;
export const reviewAbstract = async (id: string, data: { status: string, comments: string }) => (await api.post<ApiResponse<Project>>(\`/projects/\${id}/abstract/review\`, data)).data;
export const getMyProjects = async () => (await api.get<ApiResponse<Project[]>>('/projects/my-projects')).data;
export const getGuidedProjects = async () => (await api.get<ApiResponse<Project[]>>('/projects/guided')).data;
`,
  'api/guides.api.ts': `import api from './client';
import { GuidePreference, GuideAssignment, ApiResponse, FacultyProfile } from '@/types';

export const submitGuidePreferences = async (data: any) => (await api.post<ApiResponse<GuidePreference[]>>('/guides/preferences', data)).data;
export const getGuidePreferences = async (projectId: string) => (await api.get<ApiResponse<GuidePreference[]>>(\`/guides/preferences/\${projectId}\`)).data;
export const approvePreference = async (preferenceId: string) => (await api.post<ApiResponse<GuidePreference>>(\`/guides/preferences/\${preferenceId}/approve\`)).data;
export const rejectPreference = async (preferenceId: string, note?: string) => (await api.post<ApiResponse<GuidePreference>>(\`/guides/preferences/\${preferenceId}/reject\`, { note })).data;
export const assignGuide = async (data: any) => (await api.post<ApiResponse<GuideAssignment>>('/guides/assign', data)).data;
export const removeGuideAssignment = async (assignmentId: string) => (await api.delete<ApiResponse<void>>(\`/guides/assign/\${assignmentId}\`)).data;
export const getAvailableGuides = async () => (await api.get<ApiResponse<FacultyProfile[]>>('/guides/available')).data;
`,
  'api/milestones.api.ts': `import api from './client';
import { Milestone, ApiResponse, PaginatedResponse } from '@/types';

export const getMilestones = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Milestone>>>('/milestones', { params })).data;
export const getMilestone = async (id: string) => (await api.get<ApiResponse<Milestone>>(\`/milestones/\${id}\`)).data;
export const createMilestone = async (data: Partial<Milestone>) => (await api.post<ApiResponse<Milestone>>('/milestones', data)).data;
export const updateMilestone = async (id: string, data: Partial<Milestone>) => (await api.put<ApiResponse<Milestone>>(\`/milestones/\${id}\`, data)).data;
export const deleteMilestone = async (id: string) => (await api.delete<ApiResponse<void>>(\`/milestones/\${id}\`)).data;
export const updateMilestoneStatus = async (id: string, status: string) => (await api.put<ApiResponse<Milestone>>(\`/milestones/\${id}/status\`, { status })).data;
`,
  'api/submissions.api.ts': `import api from './client';
import { Submission, ApiResponse, PaginatedResponse } from '@/types';

export const createSubmission = async (formData: FormData) => (await api.post<ApiResponse<Submission>>('/submissions', formData)).data;
export const getSubmissions = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Submission>>>('/submissions', { params })).data;
export const getSubmission = async (id: string) => (await api.get<ApiResponse<Submission>>(\`/submissions/\${id}\`)).data;
export const downloadFile = async (fileId: string) => {
  const response = await api.get(\`/submissions/files/\${fileId}/download\`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'file'); // Replace with proper filename if available in headers
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const deleteFile = async (fileId: string) => (await api.delete<ApiResponse<void>>(\`/submissions/files/\${fileId}\`)).data;
`,
  'api/reviews.api.ts': `import api from './client';
import { ReviewStageTemplate, ReviewStage, EvaluationCriteria, ApiResponse, PaginatedResponse } from '@/types';

export const getTemplates = async () => (await api.get<ApiResponse<ReviewStageTemplate[]>>('/reviews/templates')).data;
export const createTemplate = async (data: Partial<ReviewStageTemplate>) => (await api.post<ApiResponse<ReviewStageTemplate>>('/reviews/templates', data)).data;
export const updateTemplate = async (id: string, data: Partial<ReviewStageTemplate>) => (await api.put<ApiResponse<ReviewStageTemplate>>(\`/reviews/templates/\${id}\`, data)).data;
export const deleteTemplate = async (id: string) => (await api.delete<ApiResponse<void>>(\`/reviews/templates/\${id}\`)).data;
export const getReviewStages = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<ReviewStage>>>('/reviews/stages', { params })).data;
export const createReviewStage = async (data: Partial<ReviewStage>) => (await api.post<ApiResponse<ReviewStage>>('/reviews/stages', data)).data;
export const updateReviewStage = async (id: string, data: Partial<ReviewStage>) => (await api.put<ApiResponse<ReviewStage>>(\`/reviews/stages/\${id}\`, data)).data;
export const deleteReviewStage = async (id: string) => (await api.delete<ApiResponse<void>>(\`/reviews/stages/\${id}\`)).data;
export const getStageCriteria = async (stageId: string) => (await api.get<ApiResponse<EvaluationCriteria[]>>(\`/reviews/stages/\${stageId}/criteria\`)).data;
export const addCriteria = async (stageId: string, data: Partial<EvaluationCriteria>) => (await api.post<ApiResponse<EvaluationCriteria>>(\`/reviews/stages/\${stageId}/criteria\`, data)).data;
export const updateCriteria = async (stageId: string, criteriaId: string, data: Partial<EvaluationCriteria>) => (await api.put<ApiResponse<EvaluationCriteria>>(\`/reviews/stages/\${stageId}/criteria/\${criteriaId}\`, data)).data;
export const deleteCriteria = async (stageId: string, criteriaId: string) => (await api.delete<ApiResponse<void>>(\`/reviews/stages/\${stageId}/criteria/\${criteriaId}\`)).data;
`,
  'api/schedules.api.ts': `import api from './client';
import { ReviewSchedule, ApiResponse, PaginatedResponse } from '@/types';

export const createSchedule = async (data: Partial<ReviewSchedule>) => (await api.post<ApiResponse<ReviewSchedule>>('/schedules', data)).data;
export const getSchedules = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<ReviewSchedule>>>('/schedules', { params })).data;
export const getSchedule = async (id: string) => (await api.get<ApiResponse<ReviewSchedule>>(\`/schedules/\${id}\`)).data;
export const updateSchedule = async (id: string, data: Partial<ReviewSchedule>) => (await api.put<ApiResponse<ReviewSchedule>>(\`/schedules/\${id}\`, data)).data;
export const deleteSchedule = async (id: string) => (await api.delete<ApiResponse<void>>(\`/schedules/\${id}\`)).data;
export const assignPanelMember = async (scheduleId: string, facultyProfileId: string) => (await api.post<ApiResponse<any>>(\`/schedules/\${scheduleId}/panel\`, { facultyProfileId })).data;
export const removePanelMember = async (scheduleId: string, facultyProfileId: string) => (await api.delete<ApiResponse<void>>(\`/schedules/\${scheduleId}/panel/\${facultyProfileId}\`)).data;
export const markAttendance = async (scheduleId: string, isPresent: boolean) => (await api.post<ApiResponse<any>>(\`/schedules/\${scheduleId}/attendance\`, { isPresent })).data;
export const completeSchedule = async (scheduleId: string) => (await api.post<ApiResponse<any>>(\`/schedules/\${scheduleId}/complete\`)).data;
export const getMySchedules = async () => (await api.get<ApiResponse<ReviewSchedule[]>>('/schedules/my-schedules')).data;
`,
  'api/evaluations.api.ts': `import api from './client';
import { Evaluation, ApiResponse, PaginatedResponse } from '@/types';

export const submitEvaluation = async (data: Partial<Evaluation>) => (await api.post<ApiResponse<Evaluation>>('/evaluations', data)).data;
export const getEvaluations = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Evaluation>>>('/evaluations', { params })).data;
export const getEvaluation = async (id: string) => (await api.get<ApiResponse<Evaluation>>(\`/evaluations/\${id}\`)).data;
export const updateEvaluation = async (id: string, data: Partial<Evaluation>) => (await api.put<ApiResponse<Evaluation>>(\`/evaluations/\${id}\`, data)).data;
export const lockEvaluation = async (id: string) => (await api.post<ApiResponse<Evaluation>>(\`/evaluations/\${id}/lock\`)).data;
export const getProjectEvaluationSummary = async (projectId: string) => (await api.get<ApiResponse<any>>(\`/evaluations/project/\${projectId}/summary\`)).data;
`,
  'api/notifications.api.ts': `import api from './client';
import { Notification, ApiResponse, PaginatedResponse } from '@/types';

export const getMyNotifications = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params })).data;
export const markRead = async (id: string) => (await api.post<ApiResponse<Notification>>(\`/notifications/\${id}/read\`)).data;
export const markAllRead = async () => (await api.post<ApiResponse<void>>('/notifications/read-all')).data;
export const getUnreadCount = async () => (await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count')).data;
`,
  'api/announcements.api.ts': `import api from './client';
import { Announcement, ApiResponse, PaginatedResponse } from '@/types';

export const createAnnouncement = async (data: Partial<Announcement>) => (await api.post<ApiResponse<Announcement>>('/announcements', data)).data;
export const getAnnouncements = async (params?: any) => (await api.get<ApiResponse<PaginatedResponse<Announcement>>>('/announcements', { params })).data;
export const getAnnouncement = async (id: string) => (await api.get<ApiResponse<Announcement>>(\`/announcements/\${id}\`)).data;
export const deleteAnnouncement = async (id: string) => (await api.delete<ApiResponse<void>>(\`/announcements/\${id}\`)).data;
`,
  'api/reports.api.ts': `import api from './client';

const downloadBlob = (response: any, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadDeptSummary = async (params?: any) => {
  const response = await api.get('/reports/department-summary', { params, responseType: 'blob' });
  downloadBlob(response, 'department-summary.pdf');
};

export const downloadProjectStatus = async (params?: any) => {
  const response = await api.get('/reports/project-status', { params, responseType: 'blob' });
  downloadBlob(response, 'project-status.xlsx');
};

export const downloadDefaulters = async (params?: any) => {
  const response = await api.get('/reports/defaulters', { params, responseType: 'blob' });
  downloadBlob(response, 'defaulters.pdf');
};

export const downloadEvaluationMarks = async (params?: any) => {
  const response = await api.get('/reports/evaluation-marks', { params, responseType: 'blob' });
  downloadBlob(response, 'evaluation-marks.xlsx');
};

export const downloadAuditLog = async (params?: any) => {
  const response = await api.get('/reports/audit-log', { params, responseType: 'blob' });
  downloadBlob(response, 'audit-log.csv');
};
`,
  'api/settings.api.ts': `import api from './client';
import { Settings, ApiResponse } from '@/types';

export const getSettings = async () => (await api.get<ApiResponse<Settings[]>>('/settings')).data;
export const updateSetting = async (key: string, value: string) => (await api.put<ApiResponse<Settings>>(\`/settings/\${key}\`, { value })).data;
export const getPublicSettings = async () => (await api.get<ApiResponse<Settings[]>>('/settings/public')).data;
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(srcDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', relPath);
}
