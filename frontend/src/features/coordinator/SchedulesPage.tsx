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
import { Textarea } from '@/components/ui/textarea';
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
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState('');

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['schedules', stageFilter],
    queryFn: () => getSchedules(stageFilter ? { reviewStageId: stageFilter } : {}),
  });
  const { data: projectsData } = useQuery({ queryKey: ['projects'], queryFn: () => getProjects({ limit: 100 }) });
  const { data: stagesData } = useQuery({ queryKey: ['review-stages'], queryFn: () => getReviewStages() });
  const { data: guidesData } = useQuery({ queryKey: ['available-guides'], queryFn: getAvailableGuides });

  const schedules = schedulesData?.data?.items || schedulesData?.data || [];
  const projects = projectsData?.data?.items || projectsData?.data || [];
  const stages = stagesData?.data || stagesData?.data?.items || [];
  const guides = guidesData?.data || [];

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { mode: 'OFFLINE', panelMemberIds: [] },
  });

  const selectedPanel = watch('panelMemberIds');

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => { toast.success('Schedule created'); qc.invalidateQueries({ queryKey: ['schedules'] }); setCreateOpen(false); reset(); },
    onError: () => toast.error('Failed to create schedule'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => { toast.success('Schedule deleted'); qc.invalidateQueries({ queryKey: ['schedules'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeSchedule(id),
    onSuccess: () => { toast.success('Schedule marked complete'); qc.invalidateQueries({ queryKey: ['schedules'] }); setCompleteId(null); },
    onError: () => toast.error('Failed to complete'),
  });

  const togglePanel = (id: string) => {
    const curr = selectedPanel || [];
    setValue('panelMemberIds', curr.includes(id) ? curr.filter((p: string) => p !== id) : [...curr, id]);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Review Schedules"
        subtitle="Schedule project review sessions with panel members"
        actions={<Button onClick={() => setCreateOpen(true)} id="create-schedule-btn"><Plus className="h-4 w-4 mr-2" /> Schedule Review</Button>}
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-gray-400 whitespace-nowrap text-sm">Filter by Stage:</Label>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white w-60" id="stage-filter">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            <SelectItem value="" className="text-gray-300">All stages</SelectItem>
            {stages.map((s: any) => <SelectItem key={s.id} value={s.id} className="text-gray-300">{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Schedules Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/5 animate-pulse" />)}</div>
        ) : schedules.length === 0 ? (
          <EmptyState icon={Calendar} title="No schedules" description="Schedule review sessions for projects" actionLabel="Schedule Review" onAction={() => setCreateOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Project</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Stage</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date & Time</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Venue</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Mode</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Panel</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s: any) => (
                  <>
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                      <td className="px-4 py-3 text-white font-medium">{s.project?.title || '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{s.reviewStage?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {format(new Date(s.scheduledAt), 'MMM d, yyyy')}
                        <div className="text-xs text-gray-500">{format(new Date(s.scheduledAt), 'h:mm a')}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.venue || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.mode === 'ONLINE' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {s.mode === 'ONLINE' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                          {s.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Users className="h-3.5 w-3.5" />{s.panelAssignments?.length || 0} members
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {s.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          {!s.isCompleted && (
                            <Button size="sm" variant="success" onClick={() => setCompleteId(s.id)} id={`complete-${s.id}`}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Done
                            </Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => setDeleteId(s.id)} id={`delete-sched-${s.id}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === s.id && (
                      <tr key={`${s.id}-expand`} className="border-b border-white/5 bg-white/3">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Panel Members</p>
                              {s.panelAssignments?.length > 0 ? (
                                <div className="space-y-1.5">
                                  {s.panelAssignments.map((pa: any) => (
                                    <div key={pa.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                                      <span className="text-sm text-white">{pa.facultyProfile?.user?.name}</span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${pa.isPresent === true ? 'bg-green-500/20 text-green-400' : pa.isPresent === false ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {pa.isPresent === true ? 'Present' : pa.isPresent === false ? 'Absent' : 'TBD'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-gray-500 text-sm">No panel members assigned</p>}
                            </div>
                            {s.notes && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Notes</p>
                                <p className="text-sm text-gray-300">{s.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Schedule Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Schedule Review Session</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select onValueChange={v => setValue('projectId', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white" id="sched-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10 max-h-48">
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id} className="text-gray-300">{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.projectId && <p className="text-red-400 text-xs">{errors.projectId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Review Stage</Label>
              <Select onValueChange={v => setValue('reviewStageId', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white" id="sched-stage"><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {stages.map((s: any) => <SelectItem key={s.id} value={s.id} className="text-gray-300">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.reviewStageId && <p className="text-red-400 text-xs">{errors.reviewStageId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date & Time</Label>
                <Input {...register('scheduledAt')} type="datetime-local" id="sched-datetime" />
                {errors.scheduledAt && <p className="text-red-400 text-xs">{errors.scheduledAt.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Venue</Label>
                <Input {...register('venue')} placeholder="e.g. Seminar Hall A" id="sched-venue" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Mode</Label>
              <div className="flex gap-4">
                {['OFFLINE', 'ONLINE'].map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={m} {...register('mode')} className="text-indigo-500" />
                    <span className="text-sm text-gray-300 flex items-center gap-1">
                      {m === 'ONLINE' ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />} {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea {...register('notes')} placeholder="Additional instructions…" rows={2} id="sched-notes" />
            </div>

            {guides.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-400 text-xs uppercase tracking-wide">Panel Members (optional)</Label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {guides.map((g: any) => (
                    <label key={g.id} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/5">
                      <Checkbox checked={(selectedPanel || []).includes(g.facultyProfile?.id || g.id)} onCheckedChange={() => togglePanel(g.facultyProfile?.id || g.id)} />
                      <div>
                        <span className="text-sm text-white">{g.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{g.facultyProfile?.designation}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} id="create-sched-submit">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Schedule" description="This will permanently delete this review schedule." confirmLabel="Delete" variant="danger" />
      <ConfirmDialog open={!!completeId} onOpenChange={o => !o && setCompleteId(null)} onConfirm={() => completeId && completeMutation.mutate(completeId)} title="Mark as Completed" description="Mark this review session as completed? This cannot be undone." confirmLabel="Complete" />
    </div>
  );
}
