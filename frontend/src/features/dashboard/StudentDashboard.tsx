import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, Calendar, Users, FileText, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import StatsCard from '@/components/shared/StatsCard';
import PageHeader from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/shared/Skeletons';
import { useMyProjects } from '@/hooks/useMyProjects';
import { useMyTeam } from '@/hooks/useMyTeam';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { ROUTES } from '@/constants/routes';
import { LIFECYCLE_STAGES, PROJECT_LIFECYCLE_STAGE_MAP } from '@/constants/status';
import { getDaysUntil } from '@/utils/formatUtils';

import { useReviewStages } from '@/hooks/useReviewStages';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);

  const { currentProject, isLoading: loadingProjects } = useMyProjects();
  const { team, isLoading: loadingTeam } = useMyTeam();
  const { announcements } = useAnnouncements();
  const { reviewStages } = useReviewStages();

  if (loadingProjects || loadingTeam) {
    return <DashboardSkeleton />;
  }

  const milestones = currentProject?.milestones || [];
  const inProgressMilestone = milestones.find((m: any) => m.status === 'IN_PROGRESS' || m.status === 'NOT_STARTED');

  // Combine project milestone deadlines and semester review stage deadlines
  const combinedDeadlines = [
    ...milestones.map((m: any) => ({ id: m.id, name: m.name, deadline: m.deadline, status: m.status })),
    ...reviewStages
      .filter((rs: any) => rs.deadline)
      .map((rs: any) => ({ id: rs.id, name: rs.name, deadline: rs.deadline, status: 'NOT_STARTED' })),
  ];

  // Remove duplicates by name and sort by deadline date
  const uniqueDeadlineMap = new Map();
  combinedDeadlines.forEach((item: any) => {
    if (!uniqueDeadlineMap.has(item.name) && item.deadline) {
      uniqueDeadlineMap.set(item.name, item);
    }
  });

  const upcomingDeadlines = Array.from(uniqueDeadlineMap.values())
    .filter((m: any) => m.status !== 'APPROVED' && m.status !== 'COMPLETED' && m.deadline)
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const nearestDeadline = upcomingDeadlines[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${authUser?.name || 'Student'}`}
        subtitle={
          currentProject
            ? `Project: "${currentProject.title}" • ${team?.name ? `Team: ${team.name}` : 'Solo Roster'}`
            : team?.name
            ? `Team: ${team.name} • Proposal Pending`
            : 'Track your project milestones, team roster, and evaluation deadlines.'
        }
        actions={
          !currentProject ? (
            <Button onClick={() => navigate(ROUTES.MY_PROJECT_CREATE)} className="btn-primary">
              <FileText className="w-4 h-4 mr-2" /> Propose New Project
            </Button>
          ) : undefined
        }
      />

      {/* Dynamic Key Performance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Project Title"
          value={currentProject?.title ? <span className="truncate block max-w-[200px]" title={currentProject.title}>{currentProject.title}</span> : 'No Project'}
          subtitle={currentProject?.domain ? `Domain: ${currentProject.domain}` : 'Proposal Needed'}
          icon={<FileText className="w-4 h-4 text-brand" />}
        />
        <StatsCard
          title="Team Name"
          value={team?.name ? team.name : 'No Team'}
          subtitle={team?.members?.length ? `${team.members.length} Member(s)` : 'Join or Create Team'}
          icon={<Users className="w-4 h-4 text-brand" />}
        />
        <StatsCard
          title="Next Milestone"
          value={inProgressMilestone?.name || 'All Clear'}
          subtitle={nearestDeadline?.deadline ? `${getDaysUntil(nearestDeadline.deadline)} days left` : 'No Pending Deadlines'}
          icon={<Clock className="w-4 h-4 text-brand" />}
        />
        <StatsCard
          title="Assigned Guide"
          value={(currentProject as any)?.guideAssignment?.facultyProfile?.user?.name || (currentProject as any)?.guide?.name || 'Unassigned'}
          subtitle={currentProject?.guideAssignment ? 'Active Mentor' : 'Awaiting Allocation'}
          icon={<Calendar className="w-4 h-4 text-brand" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Lifecycle Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  {currentProject?.title ? currentProject.title : 'Project Lifecycle Tracker'}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Academic evaluation and review stage progression.
                </p>
              </div>
              {currentProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.MY_PROJECT)}
                  className="text-brand font-medium"
                >
                  View Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-3 relative before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:bg-border">
                {LIFECYCLE_STAGES.map((stage, i) => {
                  const currentStatusIndex = PROJECT_LIFECYCLE_STAGE_MAP[currentProject?.status || 'DRAFT'] ?? 0;
                  const isDone = i < currentStatusIndex;
                  const isCurrent = i === currentStatusIndex;

                  return (
                    <div key={stage} className="relative flex items-center justify-start gap-4">
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full border-2 border-card shrink-0 z-10 text-xs font-bold',
                          isDone
                            ? 'bg-success-solid text-white'
                            : isCurrent
                            ? 'gradient-brand text-white ring-2 ring-brand'
                            : 'bg-secondary text-muted-foreground'
                        )}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-50" />}
                      </div>
                      <div className="flex-1 p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isCurrent
                              ? 'text-brand font-semibold'
                              : isDone
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {stage}
                        </span>
                        {isDone && (
                          <span className="text-xs text-success-md font-semibold bg-success-subtle border border-success px-2 py-0.5 rounded-md">
                            Passed
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-xs text-brand font-semibold bg-brand-subtle border border-brand px-2 py-0.5 rounded-md">
                            Current Stage
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Team Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  {team?.name ? `Team ${team.name}` : 'Team Roster'}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Project team members and status.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.MY_TEAM)}
                className="text-brand font-medium"
              >
                Manage Team <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {team && team.id ? (
                <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-card border border-border rounded-lg text-brand">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.members?.length || 1} Registered Member(s)</p>
                    </div>
                  </div>
                  <StatusBadge status={team.status} type="team" />
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm mb-3">You are not part of an active team roster yet.</p>
                  <Button onClick={() => navigate(ROUTES.MY_TEAM)} size="sm" className="btn-primary">
                    Create or Join Team
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Info Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No pending deadlines.</p>
              ) : (
                upcomingDeadlines.slice(0, 5).map((m: any) => {
                  const days = getDaysUntil(m.deadline);
                  const color = days < 0
                    ? 'text-danger-md bg-danger-subtle border-danger'
                    : days < 3
                    ? 'text-warning-md bg-warning-subtle border-warning'
                    : 'text-success-md bg-success-subtle border-success';
                  return (
                    <div key={m.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card">
                      <span className="font-medium text-xs text-foreground">{m.name}</span>
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md border', color)}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">Announcements</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.ANNOUNCEMENTS)} className="text-brand font-medium text-xs">
                View All
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {announcements.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No recent announcements.</p>
              ) : (
                announcements.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="border-b border-border pb-3 last:border-0 last:pb-0 space-y-1">
                    <h4 className="font-semibold text-brand text-xs">{a.title}</h4>
                    <p className="text-[11px] text-muted-foreground font-normal">
                      {formatDistanceToNow(new Date(a.createdAt || a.date || Date.now()), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-foreground line-clamp-2">{a.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
