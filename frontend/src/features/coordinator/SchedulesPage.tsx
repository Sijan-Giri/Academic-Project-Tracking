import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Trash2, CheckCircle, Wifi, WifiOff, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Checkbox, PageHeader, ConfirmDialog, EmptyState, SchedulesSkeleton } from '@/components';
import { useSchedules } from '@/hooks';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState('');

  const {
    schedules,
    projects,
    stages,
    facultyList: guides,
    isLoading,
    isCreating,
    createSchedule,
    deleteSchedule,
  } = useSchedules(stageFilter ? { reviewStageId: stageFilter } : undefined);

  const { register, handleSubmit, reset, setValue, watch } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { mode: 'OFFLINE', panelMemberIds: [] },
  });

  const selectedPanelIds = watch('panelMemberIds') || [];

  const handleCreate = async (data: ScheduleForm) => {
    try {
      const formattedDate = data.scheduledAt ? new Date(data.scheduledAt).toISOString() : new Date().toISOString();
      await createSchedule({
        ...data,
        scheduledAt: formattedDate,
      });
      setCreateOpen(false);
      reset();
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSchedule(deleteId);
      setDeleteId(null);
    } catch (_) {}
  };

  const togglePanelMember = (id: string) => {
    const current = [...selectedPanelIds];
    const idx = current.indexOf(id);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(id);
    setValue('panelMemberIds', current);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Schedules & Panel Assignments"
        subtitle="Schedule project presentation slots, assign panel evaluators, and set venues."
        actions={
          <Button onClick={() => setCreateOpen(true)} id="create-schedule-btn" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Schedule Presentation
          </Button>
        }
      />

      {}
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

      {}
      {isLoading ? (
        <SchedulesSkeleton />
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
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-subtle text-brand border border-brand">
                        {sch.reviewStage?.name || 'Review Stage'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                        sch.mode === 'ONLINE' ? 'bg-brand-subtle text-brand border-brand' : 'bg-secondary border-border text-foreground'
                      }`}>
                        {sch.mode === 'ONLINE' ? <Wifi className="w-3 h-3 inline mr-1" /> : <WifiOff className="w-3 h-3 inline mr-1" />}
                        {sch.mode}
                      </span>
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-success-subtle text-success-md border border-success">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{sch.project?.title || 'Project Presentation'}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isCompleted && (
                      <Button size="sm" variant="success" id={`complete-sch-${sch.id}`} className="text-xs font-semibold">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(sch.id)} id={`delete-sch-${sch.id}`}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-normal">
                    <Calendar className="w-4 h-4 text-brand shrink-0" />
                    <span>Time: <strong className="text-foreground font-semibold">{scheduledDate ? format(scheduledDate, 'MMM d, yyyy · h:mm a') : 'Unscheduled'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground font-normal">
                    <MapPin className="w-4 h-4 text-brand shrink-0" />
                    <span>Venue: <strong className="text-foreground font-semibold">{sch.venue || 'TBD'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground font-normal">
                    <Users className="w-4 h-4 text-brand shrink-0" />
                    <span>Panel: <strong className="text-foreground font-semibold">{panelMembers.length} Evaluators</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader><DialogTitle className="text-base font-semibold">Schedule Review Presentation</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {watch('mode') === 'ONLINE' ? 'Meeting URL / Online Link' : 'Venue / Room Location'}
              </Label>
              <Input
                {...register('venue')}
                placeholder={watch('mode') === 'ONLINE' ? 'https://meet.google.com/abc-defg-hij' : 'Lab 402, Computer Dept'}
                id="sch-venue-input"
              />
            </div>

            {}
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
              <Button type="submit" isLoading={isCreating} loadingText="Scheduling Review..." id="submit-sch-btn" className="btn-primary">
                Schedule Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Schedule Slot"
        description="Are you sure you want to delete this presentation schedule?"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}
