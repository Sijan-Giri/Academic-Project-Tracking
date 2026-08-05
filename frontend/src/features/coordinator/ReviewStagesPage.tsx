import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Trash2, PlusCircle, Loader2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import { getReviewStages, createReviewStage, deleteReviewStage, getTemplates, addCriteria, deleteCriteria } from '@/api/reviews.api';
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

const STAGE_TYPE_CLASSES: Record<string, string> = {
  ABSTRACT_REVIEW: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  REVIEW_1: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  REVIEW_2: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  REVIEW_3: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  PRE_SUBMISSION: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  FINAL_SUBMISSION: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
};

export default function ReviewStagesPage() {
  const qc = useQueryClient();
  const [semesterFilter, setSemesterFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);
  const [criteriaModal, setCriteriaModal] = useState<string | null>(null); // stageId
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const { data: stagesData, isLoading } = useQuery({
    queryKey: ['review-stages', semesterFilter],
    queryFn: () => getReviewStages(semesterFilter ? { semesterId: semesterFilter } : undefined),
  });

  const { data: templatesData } = useQuery({ queryKey: ['review-templates'], queryFn: getTemplates });
  const { data: semestersData } = useQuery({ queryKey: ['semesters'], queryFn: () => getSemesters() });
  const { data: deptsData } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });

  const rawStages = stagesData as any;
  const stages: any[] = Array.isArray(rawStages)
    ? rawStages
    : Array.isArray(rawStages?.data?.items)
    ? rawStages.data.items
    : Array.isArray(rawStages?.data)
    ? rawStages.data
    : [];

  const templates: any[] = Array.isArray(templatesData) ? templatesData : (templatesData as any)?.data || [];
  const semesters: any[] = Array.isArray(semestersData) ? semestersData : (semestersData as any)?.data?.items || (semestersData as any)?.data || [];
  const departments: any[] = Array.isArray(deptsData) ? deptsData : (deptsData as any)?.data || [];

  // Stage form
  const stageForm = useForm<StageForm>({
    resolver: zodResolver(stageSchema),
    defaultValues: { order: 1, isActive: true },
  });

  // Criteria form
  const criteriaForm = useForm<CriteriaForm>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: { order: 1, maxMarks: 20 },
  });

  const createStageMut = useMutation({
    mutationFn: (data: StageForm) => createReviewStage(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Review stage created');
      setCreateOpen(false);
      stageForm.reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create stage'),
  });

  const deleteStageMut = useMutation({
    mutationFn: (id: string) => deleteReviewStage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Stage deleted');
      setDeleteStageId(null);
    },
    onError: () => toast.error('Failed to delete stage'),
  });

  const addCriteriaMut = useMutation({
    mutationFn: ({ stageId, data }: { stageId: string; data: CriteriaForm }) => addCriteria(stageId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Criteria added');
      setCriteriaModal(null);
      criteriaForm.reset();
    },
    onError: () => toast.error('Failed to add criteria'),
  });

  const deleteCriteriaMut = useMutation({
    mutationFn: ({ stageId, criteriaId }: { stageId: string; criteriaId: string }) => deleteCriteria(stageId, criteriaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Criteria removed');
    },
    onError: () => toast.error('Failed to remove criteria'),
  });

  const openCreate = () => {
    stageForm.reset({
      order: stages.length + 1,
      isActive: true,
      departmentId: departments[0]?.id || '',
      semesterId: semesters[0]?.id || '',
    });
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Review Stages & Evaluation Criteria"
        subtitle="Define evaluation milestones, criteria breakdown, and scoring weightage for semesters."
        actions={
          <Button onClick={openCreate} id="create-stage-btn" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Review Stage
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-xs max-w-xs">
        <Select value={semesterFilter} onValueChange={v => setSemesterFilter(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="input-field" id="semester-filter-select">
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="ALL">All Semesters</SelectItem>
            {semesters.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stages List */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground font-normal">Loading review stages…</div>
      ) : stages.length === 0 ? (
        <EmptyState icon={BookOpen} title="No review stages found" description="Create a review stage to configure evaluation rubrics." />
      ) : (
        <div className="space-y-4">
          {stages.map((stg: any) => {
            const isExpanded = expandedStage === stg.id;
            const criteriaList: any[] = stg.criteria || [];
            const totalMarks = criteriaList.reduce((acc: number, c: any) => acc + (c.maxMarks || 0), 0);

            return (
              <div key={stg.id} className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      #{stg.order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-foreground font-semibold text-base">{stg.name}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${STAGE_TYPE_CLASSES[stg.type] || ''}`}>
                          {REVIEW_STAGE_LABELS[stg.type] || stg.type}
                        </span>
                        {!stg.isActive && (
                          <span className="px-2 py-0.5 rounded-md text-xs bg-secondary border border-border text-muted-foreground font-semibold">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 font-medium">
                        {stg.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            Deadline: {format(new Date(stg.deadline), 'MMM d, yyyy')}
                          </span>
                        )}
                        <span>Criteria Total: <strong className="text-foreground">{totalMarks} Marks</strong> ({criteriaList.length} items)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedStage(isExpanded ? null : stg.id)}
                      className="text-xs font-semibold"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                      {isExpanded ? 'Hide Criteria' : 'View Criteria'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setCriteriaModal(stg.id)} id={`add-criteria-btn-${stg.id}`} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Criteria
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteStageId(stg.id)} id={`delete-stage-btn-${stg.id}`}>
                      <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Criteria Table */}
                {isExpanded && (
                  <div className="border-t border-border bg-secondary/30 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Evaluation Criteria Rubric</h4>
                      <span className="text-xs text-muted-foreground font-normal">Max Total: <strong className="text-foreground font-semibold">{totalMarks} Marks</strong></span>
                    </div>

                    {criteriaList.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic font-normal">No evaluation criteria added to this stage yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {criteriaList.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{c.name}</p>
                              {c.description && <p className="text-xs text-muted-foreground font-normal">{c.description}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold">
                                {c.maxMarks} Marks
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteCriteriaMut.mutate({ stageId: stg.id, criteriaId: c.id })}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Create Review Stage */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle className="text-base font-semibold">Create Review Stage</DialogTitle></DialogHeader>
          <form onSubmit={stageForm.handleSubmit(d => createStageMut.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Template</Label>
              <Select value={stageForm.watch('templateId')} onValueChange={v => stageForm.setValue('templateId', v)}>
                <SelectTrigger className="input-field" id="template-select"><SelectValue placeholder="Select Template" /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Semester</Label>
              <Select value={stageForm.watch('semesterId')} onValueChange={v => stageForm.setValue('semesterId', v)}>
                <SelectTrigger className="input-field" id="semester-select"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {semesters.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Department</Label>
              <Select value={stageForm.watch('departmentId')} onValueChange={v => stageForm.setValue('departmentId', v)}>
                <SelectTrigger className="input-field" id="dept-select"><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Stage Name</Label>
              <Input {...stageForm.register('name')} placeholder="e.g. Review 1 Evaluation" id="stage-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Stage Type</Label>
                <Select value={stageForm.watch('type')} onValueChange={v => stageForm.setValue('type', v)}>
                  <SelectTrigger className="input-field" id="stage-type-select"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {Object.entries(REVIEW_STAGE_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Stage Order</Label>
                <Input type="number" {...stageForm.register('order')} id="stage-order-input" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Deadline (Optional)</Label>
              <Input type="date" {...stageForm.register('deadline')} id="stage-deadline-input" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createStageMut.isPending} id="submit-stage-btn" className="btn-primary">
                {createStageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Stage
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Add Evaluation Criteria */}
      <Dialog open={!!criteriaModal} onOpenChange={o => !o && setCriteriaModal(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle className="text-base font-semibold">Add Evaluation Criteria</DialogTitle></DialogHeader>
          <form onSubmit={criteriaForm.handleSubmit(d => criteriaModal && addCriteriaMut.mutate({ stageId: criteriaModal, data: d }))} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Criteria Name</Label>
              <Input {...criteriaForm.register('name')} placeholder="e.g. Methodology & Implementation Quality" id="criteria-name-input" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Description (Optional)</Label>
              <Textarea {...criteriaForm.register('description')} placeholder="Rubric details for evaluators..." rows={2} id="criteria-desc-input" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Max Marks</Label>
                <Input type="number" {...criteriaForm.register('maxMarks')} id="criteria-marks-input" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Display Order</Label>
                <Input type="number" {...criteriaForm.register('order')} id="criteria-order-input" />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="ghost" onClick={() => setCriteriaModal(null)}>Cancel</Button>
              <Button type="submit" disabled={addCriteriaMut.isPending} id="submit-criteria-btn" className="btn-primary">
                {addCriteriaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Add Criteria
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Confirm */}
      <ConfirmDialog
        open={!!deleteStageId}
        onOpenChange={o => !o && setDeleteStageId(null)}
        title="Delete Review Stage"
        description="Are you sure? This will remove this review stage and all associated criteria."
        onConfirm={() => deleteStageId && deleteStageMut.mutate(deleteStageId)}
        variant="danger"
      />
    </div>
  );
}
