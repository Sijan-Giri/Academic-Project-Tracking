import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { MapPin, Users, ExternalLink, Calendar as CalendarIcon, Video, Copy, Check, UserCheck, ShieldCheck } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SchedulesSkeleton } from '@/components/shared/Skeletons';
import { useMySchedules } from '@/hooks/useMySchedules';
import { useAuthStore } from '@/store/auth.store';

export default function MySchedulesPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { schedules, isLoading } = useMySchedules();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (scheduleId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(scheduleId);
    toast.success('Meeting link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const upcoming = schedules.filter((s: any) => {
    const sDate = s.scheduledAt || s.date;
    return (sDate && isFuture(new Date(sDate))) || !s.isCompleted;
  });

  const past = schedules.filter((s: any) => {
    const sDate = s.scheduledAt || s.date;
    return (sDate && isPast(new Date(sDate))) && s.isCompleted;
  });

  const renderScheduleList = (list: any[]) => (
    <div className="space-y-6 mt-6">
      {list.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No Presentation Schedules Found"
          description="You do not have any presentation schedules or evaluation slots assigned for this view."
        />
      ) : (
        list.map((s: any) => {
          const sDate = s.scheduledAt || s.date;
          const dateObj = sDate ? new Date(sDate) : new Date();
          const isOnline = s.mode === 'ONLINE' || (s.venue && (s.venue.startsWith('http://') || s.venue.startsWith('https://')));
          const meetingUrl = isOnline ? (s.venue?.startsWith('http') ? s.venue : `https://${s.venue}`) : null;
          const panelMembers: any[] = s.panelAssignments || s.panel || [];

          return (
            <Card key={s.id} className="overflow-hidden border border-border shadow-md hover:border-brand transition-all rounded-2xl bg-card">
              <CardContent className="p-0">
                {/* Header Banner */}
                <div className="bg-secondary/40 px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-brand-subtle text-brand border border-brand text-xs font-bold uppercase tracking-wider">
                      {s.reviewStage?.name || 'Review Stage'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      isOnline ? 'bg-brand-subtle text-brand border-brand' : 'bg-slate-500/10 text-dark-muted border-slate-500/30'
                    }`}>
                      {isOnline ? <Video className="w-3.5 h-3.5 inline mr-1 text-brand" /> : <MapPin className="w-3.5 h-3.5 inline mr-1 text-dark-muted" />}
                      {isOnline ? 'Online Presentation' : 'In-Person / Offline'}
                    </span>
                  </div>

                  {s.isCompleted ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-subtle text-success-md border border-success">
                      Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning-subtle text-warning-md border border-warning">
                      Scheduled Presentation
                    </span>
                  )}
                </div>

                {/* Main Content Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Project Details & Date */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-brand-subtle border border-brand rounded-xl p-3.5 text-center shrink-0 min-w-[76px]">
                        <span className="block text-2xl font-black text-brand tracking-tight leading-none">{format(dateObj, 'dd')}</span>
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">{format(dateObj, 'MMM')}</span>
                        <span className="block text-[11px] text-foreground font-semibold mt-1">{format(dateObj, 'h:mm a')}</span>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug">
                          {s.project?.title || 'Academic Project Presentation'}
                        </h3>
                        <p className="text-xs text-muted-foreground font-normal flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand shrink-0" />
                          Team: <strong className="text-foreground">{s.project?.team?.name || s.team?.name || 'Project Team'}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Online Meeting / Location Banner */}
                    {isOnline && meetingUrl ? (
                      <div className="rounded-xl border border-brand bg-brand-subtle p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
                            <Video className="w-4 h-4 text-brand" />
                            Live Online Meeting Room
                          </div>
                          <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-success-subtle animate-pulse" /> Active Link
                          </span>
                        </div>

                        <p className="text-xs text-foreground font-mono truncate bg-gray/10 p-2.5 rounded-lg border border-white/10 select-all">
                          {meetingUrl}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <a
                            href={meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gradient-brand gradient-brand-hover text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all"
                          >
                            <Video className="w-4 h-4" />
                            Join Online Presentation
                            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                          </a>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(s.id, meetingUrl)}
                            className="btn-outline text-xs gap-1.5"
                          >
                            {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-brand" />}
                            {copiedId === s.id ? 'Copied' : 'Copy Link'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-secondary/30 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Venue / Presentation Room</span>
                          <span className="text-sm font-bold text-foreground">{s.venue || 'Venue Room TBD'}</span>
                        </div>
                      </div>
                    )}

                    {/* Notes if provided */}
                    {s.notes && (
                      <div className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border font-normal">
                        <strong>Coordinator Notes:</strong> {s.notes}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Panel Members & Actions */}
                  <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-border lg:pl-6 pt-4 lg:pt-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-brand" />
                        Assigned Panel Evaluators ({panelMembers.length})
                      </h4>

                      {panelMembers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No panel members assigned yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {panelMembers.map((pm: any) => {
                            const facName = pm.facultyProfile?.user?.name || pm.name || 'Faculty Evaluator';
                            const facDesig = pm.facultyProfile?.designation || 'Panel Member';

                            return (
                              <div key={pm.id || facName} className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/30 border border-border">
                                <div className="w-7 h-7 rounded-full bg-brand-subtle text-brand font-bold text-xs flex items-center justify-center shrink-0">
                                  {facName.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-foreground truncate">{facName}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{facDesig}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Button depending on User Role */}
                    <div className="pt-3 border-t border-border space-y-3">
                      {(user?.role === 'PANEL' || user?.role === 'FACULTY' || user?.role === 'COORDINATOR' || user?.role === 'ADMIN') && !s.isCompleted && (
                        <Button
                          className="btn-primary w-full text-xs font-semibold py-2.5"
                          onClick={() => navigate(`/evaluations/${s.id}`)}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Evaluate Presentation
                        </Button>
                      )}

                      {user?.role === 'STUDENT' && (
                        <Button
                          variant="outline"
                          className="btn-outline w-full text-xs font-semibold"
                          onClick={() => navigate('/my-project')}
                        >
                          View Project & Deliverables
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presentation Schedules & Links"
        subtitle="View review presentation schedules, join live online meeting links, and check panel evaluators."
      />

      {isLoading ? (
        <SchedulesSkeleton />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card border border-border p-1 rounded-xl">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground font-semibold text-xs rounded-lg px-4 py-2">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground font-semibold text-xs rounded-lg px-4 py-2">
              Completed ({past.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {renderScheduleList(upcoming)}
          </TabsContent>
          <TabsContent value="past">
            {renderScheduleList(past)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
