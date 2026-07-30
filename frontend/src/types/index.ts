export type Role = 'ADMIN' | 'COORDINATOR' | 'FACULTY' | 'PANEL' | 'STUDENT';
export type ProjectStatus = 'DRAFT' | 'ABSTRACT_SUBMITTED' | 'ABSTRACT_APPROVED' | 'ABSTRACT_REJECTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED';
export type TeamStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReviewStageType = 'ABSTRACT_REVIEW' | 'REVIEW_1' | 'REVIEW_2' | 'REVIEW_3' | 'PRE_SUBMISSION' | 'FINAL_SUBMISSION';
export type ScheduleMode = 'ONLINE' | 'OFFLINE';
export type NotificationType = 'DEADLINE_REMINDER' | 'STATUS_CHANGE' | 'FEEDBACK' | 'ANNOUNCEMENT' | 'GENERAL';

export interface ApiResponse<T> { success: boolean; data: T; message: string; }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; limit: number; totalPages: number; }

export interface User { id: string; email: string; name: string; role: Role; isActive: boolean; createdAt: string; studentProfile?: StudentProfile; facultyProfile?: FacultyProfile; }
export interface StudentProfile { id: string; userId: string; studentId: string; batchId: string; currentSemesterId?: string; phone?: string; batch?: Batch; }
export interface FacultyProfile { id: string; userId: string; facultyId: string; departmentId: string; designation?: string; specialization?: string; phone?: string; department?: Department; }
export interface Department { id: string; name: string; code: string; description?: string; hodId?: string; isActive: boolean; createdAt: string; }
export interface AcademicYear { id: string; startYear: number; endYear: number; label: string; isActive: boolean; createdAt: string; }
export interface Batch { id: string; departmentId: string; academicYearId: string; name: string; isActive: boolean; department?: Department; academicYear?: AcademicYear; }
export interface Semester { id: string; batchId: string; number: number; name: string; startDate?: string; endDate?: string; isActive: boolean; isCurrent: boolean; batch?: Batch; }
export interface TeamMember { id: string; teamId: string; studentProfileId: string; isLeader: boolean; studentProfile?: StudentProfile & { user: User }; }
export interface Team { id: string; name: string; semesterId: string; status: TeamStatus; approvedById?: string; approvedAt?: string; rejectionReason?: string; createdAt: string; members?: TeamMember[]; project?: Project; }
export interface Project { id: string; title: string; abstract?: string; domain?: string; keywords: string[]; status: ProjectStatus; semesterId: string; teamId: string; githubLink?: string; plagiarismScore?: number; createdAt: string; updatedAt: string; team?: Team; guideAssignment?: GuideAssignment; milestones?: Milestone[]; }
export interface GuideAssignment { id: string; projectId: string; facultyProfileId: string; assignedAt: string; isActive: boolean; facultyProfile?: FacultyProfile & { user: User }; }
export interface GuidePreference { id: string; projectId: string; facultyProfileId: string; rank: number; status: string; note?: string; facultyProfile?: FacultyProfile & { user: User }; }
export interface ReviewStageTemplate { id: string; name: string; type: ReviewStageType; description?: string; order: number; isDefault: boolean; departmentId?: string; }
export interface ReviewStage { id: string; templateId: string; semesterId: string; departmentId: string; name: string; type: ReviewStageType; order: number; deadline?: string; isActive: boolean; criteria?: EvaluationCriteria[]; }
export interface ReviewSchedule { id: string; reviewStageId: string; projectId: string; scheduledAt: string; venue?: string; mode: ScheduleMode; notes?: string; isCompleted: boolean; panelAssignments?: PanelAssignment[]; project?: Project; reviewStage?: ReviewStage; }
export interface PanelAssignment { id: string; scheduleId: string; facultyProfileId: string; isPresent?: boolean; facultyProfile?: FacultyProfile & { user: User }; }
export interface EvaluationCriteria { id: string; reviewStageId: string; name: string; description?: string; maxMarks: number; order: number; }
export interface Evaluation { id: string; projectId: string; reviewStageId: string; evaluatorId: string; totalMarks?: number; grade?: string; feedback?: string; isLocked: boolean; lockedAt?: string; createdAt: string; scores?: EvaluationScore[]; }
export interface EvaluationScore { id: string; evaluationId: string; criteriaId: string; marks: number; remarks?: string; criteria?: EvaluationCriteria; }
export interface Milestone { id: string; projectId: string; reviewStageId?: string; name: string; description?: string; deadline?: string; status: MilestoneStatus; requiredDocuments: string[]; order: number; submissions?: Submission[]; }
export interface Submission { id: string; milestoneId: string; submittedById: string; submittedAt: string; notes?: string; version: number; files?: FileRecord[]; }
export interface FileRecord { id: string; originalName: string; storagePath: string; mimeType: string; sizeBytes: number; uploadedAt: string; }
export interface Notification { id: string; userId: string; title: string; message: string; type: NotificationType; isRead: boolean; relatedProjectId?: string; createdAt: string; }
export interface Announcement { id: string; title: string; content: string; createdById: string; createdAt: string; targets?: AnnouncementTarget[]; }
export interface AnnouncementTarget { id: string; announcementId: string; departmentId?: string; batchId?: string; semesterId?: string; }
export interface AuditLog { id: string; userId: string; action: string; entityType: string; entityId: string; oldValue?: unknown; newValue?: unknown; createdAt: string; user?: User; }
export interface Settings { id: string; key: string; value: string; description?: string; }
