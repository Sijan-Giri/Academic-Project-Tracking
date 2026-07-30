import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Trash2, Edit2, PlusCircle, Loader2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import { getReviewStages, createReviewStage, updateReviewStage, deleteReviewStage, getTemplates, getStageCriteria, addCriteria, deleteCriteria } from '@/api/reviews.api';
import { getSemesters } from '@/api/semesters.api';
import { getDepartments } from '@/api/departments.api';
import { REVIEW_STAGE_LABELS } from '@/lib/constants';

const stageSchema = z.object({
  templateId: z.string().min(1, 'Template required'),
  semesterId: z.string().min(1, 'Semester required'),
  departmentId: z.string().min(1, 'Department required'),
  name: z.string().min(3),
  type: z.string().min(1),
  order: z.coerce.number().int().min(1),
  deadline: z.string().optional(),
  isActive: z.boolean().default(true),
});

const criteriaSchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  maxMarks: z.coerce.number().positive('Max marks must be positive'),
  order: z.coerce.number().int().min(1),
});

type StageForm = z.infer<typeof stageSchema>;
type CriteriaForm = z.infer<typeof criteriaSchema>;

const STAGE_TYPE_COLORS: Record<string, string> = {
  ABSTRACT_REVIEW: 'bg-blue-500/20 text-blue-400',
  REVIEW_1: 'bg-indigo-500/20 text-indigo-400',
  REVIEW_2: 'bg-purple-500/20 text-purple-400',
  REVIEW_3: 'bg-violet-500/20 text-violet-400',
  PRE_SUBMISSION: 'bg-orange-500/20 text-orange-400',
  FINAL_SUBMISSION: 'bg-green-500/20 text-green-400',
};

export default function ReviewStagesPage() {
  const qc = useQueryClient();
  const [semesterFilter, setSemesterFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editStage, setEditStage] = useState<any | null>(null);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);
  const [criteriaModal, setCriteriaModal] = useState<string | null>(null); // stageId
  const [deleteCriteriaId, setDeleteCriteriaId] = useState<{ stageId: string; criteriaId: string } | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const { data: stagesData, isLoading } = useQuery({
    queryKey: ['review-stages', semesterFilter],
    queryFn: () => getReviewStages(semesterFilter ? { semesterId: semesterFilter } : {}),
  });
  const { data: templatesData } = useQuery({ queryKey: ['review-templates'], queryFn: getTemplates });
  const { data: semestersData } = useQuery({ queryKey: ['semesters'], queryFn: () => getSemesters() });
  const { data: deptsData } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });

  const stages = stagesData?.data || stagesData?.data?.items || [];
  const templates = templatesData?.data || [];
  const semesters = semestersData?.data?.items || semestersData?.data || [];
  const depts = deptsData?.data || [];

  const stageForm = useForm<StageForm>({ resolver: zodResolver(stageSchema), defaultValues: { isActive: true, order: 1 } });
  const criteriaForm = useForm<CriteriaForm>({ resolver: zodResolver(criteriaSchema), defaultValues: { order: 1 } });

  const createStageMutation = useMutation({
    mutationFn: createReviewStage,
    onSuccess: () => { toast.success('Review stage created'); qc.invalidateQueries({ queryKey: ['review-stages'] }); setCreateOpen(false); stageForm.reset(); },
    onError: () => toast.error('Failed to create stage'),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StageForm> }) => updateReviewStage(id, data),
    onSuccess: () => { toast.success('Stage updated'); qc.invalidateQueries({ queryKey: ['review-stages'] }); setEditStage(null); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteStageMutation = useMutation({
    mutationFn: (id: string) => deleteReviewStage(id),
    onSuccess: () => { toast.success('Stage deleted'); qc.invalidateQueries({ queryKey: ['review-stages'] }); setDeleteStageId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  const addCriteriaMutation = useMutation({
    mutationFn: ({ stageId, data }: { stageId: string; data: CriteriaForm }) => addCriteria(stageId, data),
    onSuccess: () => { toast.success('Criterion added'); qc.invalidateQueries({ queryKey: ['review-stages'] }); setCriteriaModal(null); criteriaForm.reset(); },
    onError: () => toast.error('Failed to add criterion'),
  });

  const deleteCriteriaMutation = useMutation({
    mutationFn: ({ stageId, criteriaId }: { stageId: string; criteriaId: string }) => deleteCriteria(stageId, criteriaId),
    onSuccess: () => { toast.success('Criterion deleted'); qc.invalidateQueries({ queryKey: ['review-stages'] }); setDeleteCriteriaId(null); },
    onError: () => toast.error('Failed to delete criterion'),
  });

  const handleTemplateChange = (templateId: string) => {
    const tpl = templates.find((t: any) => t.id === templateId);
    if (tpl) { stageForm.setValue('name', tpl.name); stageForm.setValue('type', tpl.type); stageForm.setValue('order', tpl.order); }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Review Stages"
        subtitle="Configure review stages and evaluation criteria for semesters"
        actions={<Button onClick={() => setCreateOpen(true)} id="create-stage-btn"><Plus className="h-4 w-4 mr-2" /> Create Stage</Button>}
      />

      {/* Semester Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-gray-400 whitespace-nowrap">Filter by Semester:</Label>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white w-60" id="sem-filter">
            <SelectValue placeholder="All semesters" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            <SelectItem value="" className="text-gray-300">All semesters</SelectItem>
            {semesters.map((s: any) => <SelectItem key={s.id} value={s.id} className="text-gray-300">{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl" />)}
        </div>
      ) : !Array.isArray(stages) || stages.length === 0 ? (
        <EmptyState icon={BookOpen} title="No review stages" description="Create review stages to manage project evaluation schedules" actionLabel="Create Stage" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stages.map((stage: any) => (
            <div key={stage.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-colors">
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">#{stage.order}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_TYPE_COLORS[stage.type] || 'bg-gray-500/20 text-gray-400'}`}>
                        {REVIEW_STAGE_LABELS[stage.type] || stage.type}
                      </span>
                      {!stage.isActive && <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">Inactive</span>}
                    </div>
                    <h3 className="font-semibold text-white">{stage.name}</h3>
                    {stage.deadline && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Deadline: {format(new Date(stage.deadline), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => { setEditStage(stage); stageForm.reset({ name: stage.name, type: stage.type, order: stage.order, isActive: stage.isActive, deadline: stage.deadline?.substring(0, 16) }); }} id={`edit-stage-${stage.id}`}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleteStageId(stage.id)} id={`delete-stage-${stage.id}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Criteria Section */}
                <div>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors w-full" onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}>
                    {expandedStage === stage.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {(stage.criteria?.length || 0)} Criteria
                  </button>
                  {expandedStage === stage.id && (
                    <div className="mt-2 space-y-1.5">
                      {(stage.criteria || []).map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg group">
                          <div>
                            <span className="text-sm text-white">{c.name}</span>
                            <span className="ml-2 text-xs text-gray-400">/ {c.maxMarks} marks</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteCriteriaId({ stageId: stage.id, criteriaId: c.id })} id={`del-criteria-${c.id}`}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 mt-1" onClick={() => { setCriteriaModal(stage.id); criteriaForm.reset({ order: (stage.criteria?.length || 0) + 1 }); }} id={`add-criteria-${stage.id}`}>
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Add Criterion
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Stage Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Create Review Stage</DialogTitle></DialogHeader>
          <form onSubmit={stageForm.handleSubmit(d => createStageMutation.mutate(d))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Template</Label>
                <Select onValueChange={v => { stageForm.setValue('templateId', v); handleTemplateChange(v); }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" id="stage-template"><SelectValue placeholder="Select template" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {templates.map((t: any) => <SelectItem key={t.id} value={t.id} className="text-gray-300">{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Semester</Label>
                <Select onValueChange={v => stageForm.setValue('semesterId', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" id="stage-semester"><SelectValue placeholder="Select semester" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {semesters.map((s: any) => <SelectItem key={s.id} value={s.id} className="text-gray-300">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Department</Label>
                <Select onValueChange={v => stageForm.setValue('departmentId', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" id="stage-dept"><SelectValue placeholder="Select dept" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {depts.map((d: any) => <SelectItem key={d.id} value={d.id} className="text-gray-300">{d.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Name</Label>
                <Input {...stageForm.register('name')} placeholder="Stage name" id="stage-name" />
              </div>
              <div className="space-y-1">
                <Label>Order</Label>
                <Input {...stageForm.register('order')} type="number" min={1} id="stage-order" />
              </div>
              <div className="space-y-1">
                <Label>Deadline (optional)</Label>
                <Input {...stageForm.register('deadline')} type="datetime-local" id="stage-deadline" />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Switch checked={stageForm.watch('isActive')} onCheckedChange={v => stageForm.setValue('isActive', v)} id="stage-active" />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createStageMutation.isPending} id="create-stage-submit">
                {createStageMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Stage
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={!!editStage} onOpenChange={o => !o && setEditStage(null)}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>Edit Stage</DialogTitle></DialogHeader>
          <form onSubmit={stageForm.handleSubmit(d => editStage && updateStageMutation.mutate({ id: editStage.id, data: d }))} className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input {...stageForm.register('name')} id="edit-stage-name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Order</Label><Input {...stageForm.register('order')} type="number" id="edit-stage-order" /></div>
              <div className="space-y-1"><Label>Deadline</Label><Input {...stageForm.register('deadline')} type="datetime-local" id="edit-stage-deadline" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={stageForm.watch('isActive')} onCheckedChange={v => stageForm.setValue('isActive', v)} id="edit-stage-active" />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditStage(null)}>Cancel</Button>
              <Button type="submit" disabled={updateStageMutation.isPending} id="edit-stage-submit">
                {updateStageMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Criterion Dialog */}
      <Dialog open={!!criteriaModal} onOpenChange={o => !o && setCriteriaModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>Add Evaluation Criterion</DialogTitle></DialogHeader>
          <form onSubmit={criteriaForm.handleSubmit(d => criteriaModal && addCriteriaMutation.mutate({ stageId: criteriaModal, data: d }))} className="space-y-3">
            <div className="space-y-1"><Label>Criterion Name</Label><Input {...criteriaForm.register('name')} placeholder="e.g. Innovation & Creativity" id="criteria-name" />{criteriaForm.formState.errors.name && <p className="text-red-400 text-xs">{criteriaForm.formState.errors.name.message}</p>}</div>
            <div className="space-y-1"><Label>Description</Label><Textarea {...criteriaForm.register('description')} placeholder="Describe what is evaluated…" rows={2} id="criteria-desc" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Max Marks</Label><Input {...criteriaForm.register('maxMarks')} type="number" min={1} id="criteria-marks" />{criteriaForm.formState.errors.maxMarks && <p className="text-red-400 text-xs">{criteriaForm.formState.errors.maxMarks.message}</p>}</div>
              <div className="space-y-1"><Label>Order</Label><Input {...criteriaForm.register('order')} type="number" min={1} id="criteria-order" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCriteriaModal(null)}>Cancel</Button>
              <Button type="submit" disabled={addCriteriaMutation.isPending} id="add-criteria-submit">
                {addCriteriaMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Criterion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteStageId} onOpenChange={o => !o && setDeleteStageId(null)} onConfirm={() => deleteStageId && deleteStageMutation.mutate(deleteStageId)} title="Delete Stage" description="This will permanently delete this review stage and all its criteria." confirmLabel="Delete" variant="danger" />
      <ConfirmDialog open={!!deleteCriteriaId} onOpenChange={o => !o && setDeleteCriteriaId(null)} onConfirm={() => deleteCriteriaId && deleteCriteriaMutation.mutate(deleteCriteriaId)} title="Delete Criterion" description="Remove this evaluation criterion from the stage?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
