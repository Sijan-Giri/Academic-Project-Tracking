import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Trash2, CheckCircle, Wifi, WifiOff, Loader2, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import { createSchedule, getSchedules, deleteSchedule, completeSchedule } from '@/api/schedules.api';
import { getProjects } from '@/api/projects.api';
import { getReviewStages } from '@/api/reviews.api';
import { getAvailableGuides } from '@/api/guides.api';

const scheduleSchema = z.object({
  reviewStageId: z.string().min(1, 'Review stage required'),
  projectId: z.string().min(1, 'Project required'),
  scheduledAt: z.string().min(1, 'Date/time required'),
  venue: z.string().optional(),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  notes: z.string().optional(),
  panelMemberIds: z.array(z.string()).default([]),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

export default function SchedulesPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState('');

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['schedules', stageFilter],
    queryFn: () => getSchedules(stageFilter ? { reviewStageId: stageFilter } : {}),
  });
  const { data: projectsData } = useQuery({ queryKey: ['projects'], queryFn: () => getProjects({ limit: 100 }) });
  const { data: stagesData } = useQuery({ queryKey: ['review-stages'], queryFn: () => getReviewStages() });
  const { data: guidesData } = useQuery({ queryKey: ['available-guides'], queryFn: getAvailableGuides });

  const schedules: any[] = Array.isArray(schedulesData) ? schedulesData : ((schedulesData as any)?.data?.items || (schedulesData as any)?.data || []);
  const projects: any[] = Array.isArray(projectsData) ? projectsData : ((projectsData as any)?.data?.items || (projectsData as any)?.data || []);
  const stages: any[] = Array.isArray(stagesData) ? stagesData : ((stagesData as any)?.data?.items || (stagesData as any)?.data || []);
  const guides: any[] = Array.isArray(guidesData) ? guidesData : ((guidesData as any)?.data || []);

  const { register, handleSubmit, reset, setValue, watch } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { mode: 'OFFLINE', panelMemberIds: [] },
  });

  const selectedPanelIds = watch('panelMemberIds') || [];

  const createMut = useMutation({
    mutationFn: (data: ScheduleForm) => createSchedule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule created & panel notified');
      setCreateOpen(false);
      reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create schedule'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete schedule'),
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => completeSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule marked completed');
    },
    onError: () => toast.error('Failed to complete schedule'),
  });

  const togglePanelMember = (id: string) => {
    const current = [...selectedPanelIds];
    const idx = current.indexOf(id);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(id);
    setValue('panelMemberIds', current);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Review Schedules & Panel Assignments"
        subtitle="Schedule project presentation slots, assign panel evaluators, and set venues."
        actions={
          <Button onClick={() => setCreateOpen(true)} id="create-schedule-btn" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Schedule Presentation
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-xs max-w-xs">
        <Select value={stageFilter} onValueChange={v => setStageFilter(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="input-field" id="schedule-stage-filter">
            <SelectValue placeholder="All Review Stages" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="ALL">All Review Stages</SelectItem>
            {stages.map((st: any) => (
              <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground font-normal">Loading review schedules…</div>
      ) : schedules.length === 0 ? (
        <EmptyState icon={Calendar} title="No review schedules found" description="Schedule presentation slots for project evaluation panels." />
      ) : (
        <div className="space-y-4">
          {schedules.map((sch: any) => {
            const isCompleted = sch.isCompleted;
            const scheduledDate = sch.scheduledAt ? new Date(sch.scheduledAt) : null;
            const panelMembers: any[] = sch.panelAssignments || sch.panel || [];

            return (
              <div key={sch.id} className="bg-card border border-border rounded-xl shadow-xs p-6 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {sch.reviewStage?.name || 'Review Stage'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                        sch.mode === 'ONLINE' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-secondary border-border text-foreground'
                      }`}>
                        {sch.mode === 'ONLINE' ? <Wifi className="w-3 h-3 inline mr-1" /> : <WifiOff className="w-3 h-3 inline mr-1" />}
                        {sch.mode}
                      </span>
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{sch.project?.title || 'Project Presentation'}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isCompleted && (
                      <Button size="sm" variant="success" onClick={() => completeMut.mutate(sch.id)} disabled={completeMut.isPending} id={`complete-sch-${sch.id}`} className="text-xs font-semibold">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(sch.id)} id={`delete-sch-${sch.id}`}>
                      <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-normal">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Time: <strong className="text-foreground font-semibold">{scheduledDate ? format(scheduledDate, 'MMM d, yyyy · h:mm a') : 'Unscheduled'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground font-normal">
                    <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Venue: <strong className="text-foreground font-semibold">{sch.venue || 'TBD'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground font-normal">
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Panel: <strong className="text-foreground font-semibold">{panelMembers.length} Evaluators</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule Presentation */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader><DialogTitle className="text-base font-semibold">Schedule Review Presentation</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Review Stage</Label>
              <Select value={watch('reviewStageId')} onValueChange={v => setValue('reviewStageId', v)}>
                <SelectTrigger className="input-field" id="sch-stage-select"><SelectValue placeholder="Choose Stage" /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {stages.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Project</Label>
              <Select value={watch('projectId')} onValueChange={v => setValue('projectId', v)}>
                <SelectTrigger className="input-field" id="sch-project-select"><SelectValue placeholder="Choose Project" /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Date & Time</Label>
                <Input type="datetime-local" {...register('scheduledAt')} id="sch-date-input" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Mode</Label>
                <Select value={watch('mode')} onValueChange={v => setValue('mode', v as any)}>
                  <SelectTrigger className="input-field" id="sch-mode-select"><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                    <SelectItem value="ONLINE">ONLINE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Venue / Room / Link</Label>
              <Input {...register('venue')} placeholder="e.g. Lab 402 or Google Meet URL" id="sch-venue-input" />
            </div>

            {/* Panel Evaluators Selection */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Assign Panel Evaluators</Label>
              <div className="max-h-36 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-secondary/30">
                {guides.map((g: any) => {
                  const profId = g.facultyProfileId || g.facultyProfile?.id || g.id;
                  const isChecked = selectedPanelIds.includes(profId);
                  return (
                    <div key={profId} className="flex items-center space-x-2">
                      <Checkbox id={`panel-${profId}`} checked={isChecked} onCheckedChange={() => togglePanelMember(profId)} />
                      <label htmlFor={`panel-${profId}`} className="text-xs font-semibold text-foreground cursor-pointer select-none">
                        {g.name} ({g.facultyProfile?.designation || 'Faculty'})
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending} id="submit-sch-btn" className="btn-primary">
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Schedule Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Schedule Slot"
        description="Are you sure you want to delete this presentation schedule?"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        variant="danger"
      />
    </div>
  );
}
