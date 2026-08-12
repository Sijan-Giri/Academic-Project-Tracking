import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Trash2, PlusCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, PageHeader, ConfirmDialog, EmptyState, ReviewStagesSkeleton } from '@/components';
import { REVIEW_STAGE_LABELS } from '@/lib';
import { useReviewStages, useSemesters, useDepartments, useReviewTemplates } from '@/hooks';
import toast from 'react-hot-toast';

const stageSchema = z.object({
  templateId: z.string().optional().or(z.literal('')),
  semesterId: z.string().min(1, 'Semester required'),
  departmentId: z.string().min(1, 'Department required'),
  name: z.string().min(2, 'Stage name is required'),
  type: z.string().min(1, 'Stage type is required'),
  order: z.coerce.number().int().min(1),
  deadline: z.string().optional().or(z.literal('')),
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
  ABSTRACT_REVIEW: 'bg-brand-subtle text-brand border-brand',
  REVIEW_1: 'bg-brand-subtle text-brand border-brand',
  REVIEW_2: 'bg-brand-subtle text-brand border-brand',
  REVIEW_3: 'bg-brand-subtle text-brand border-brand',
  PRE_SUBMISSION: 'bg-brand-subtle text-brand border-brand',
  FINAL_SUBMISSION: 'bg-brand-subtle text-brand border-brand',
};

export default function ReviewStagesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [criteriaModal, setCriteriaModal] = useState<string | null>(null);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState('');

  const {
    reviewStages: stages,
    isLoading,
    isCreatingStage,
    isAddingCriteria,
    createReviewStage,
    deleteReviewStage,
    addCriteria,
    deleteCriteria,
  } = useReviewStages(semesterFilter ? { semesterId: semesterFilter } : undefined);

  const { semesters } = useSemesters();
  const { departments } = useDepartments();
  const { templates } = useReviewTemplates();

  const stageForm = useForm<StageForm>({
    resolver: zodResolver(stageSchema),
    defaultValues: { order: 1, isActive: true },
  });

  const criteriaForm = useForm<CriteriaForm>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: { order: 1, maxMarks: 20 },
  });

  const handleCreateStage = async (data: StageForm) => {
    const targetSemesterId = data.semesterId || semesters[0]?.id;
    const targetDepartmentId = data.departmentId || departments[0]?.id;

    try {
      const payload = {
        ...data,
        semesterId: targetSemesterId || undefined,
        departmentId: targetDepartmentId || undefined,
        templateId: data.templateId || undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      };
      await createReviewStage(payload as any);
      setCreateOpen(false);
      stageForm.reset();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteStage = async () => {
    if (!deleteStageId) return;
    try {
      await deleteReviewStage(deleteStageId);
      setDeleteStageId(null);
    } catch (_) {}
  };

  const handleAddCriteria = async (data: CriteriaForm) => {
    if (!criteriaModal) return;
    try {
      await addCriteria({ stageId: criteriaModal, data });
      setCriteriaModal(null);
      criteriaForm.reset();
    } catch (_) {}
  };

  const handleDeleteCriteria = async (stageId: string, criteriaId: string) => {
    try {
      await deleteCriteria({ stageId, criteriaId });
    } catch (_) {}
  };

  const openCreate = () => {
    stageForm.reset({
      templateId: templates[0]?.id || '',
      semesterId: semesters[0]?.id || '',
      departmentId: departments[0]?.id || '',
      name: 'Review 1 Evaluation',
      type: 'REVIEW_1',
      order: (stages.length || 0) + 1,
      isActive: true,
      deadline: '',
    });
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Stages & Evaluation Criteria"
        subtitle="Define evaluation milestones, criteria breakdown, and scoring weightage for semesters."
        actions={
          <Button onClick={openCreate} id="create-stage-btn" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Review Stage
          </Button>
        }
      />

      {}
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

      {}
      {isLoading ? (
        <ReviewStagesSkeleton />
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
                            <Calendar className="h-3.5 w-3.5 text-brand" />
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
                    <Button size="sm" variant="ghost" onClick={() => setCriteriaModal(stg.id)} id={`add-criteria-btn-${stg.id}`} className="text-xs font-semibold text-brand">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Criteria
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteStageId(stg.id)} id={`delete-stage-btn-${stg.id}`}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>

                {}
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
                              <span className="px-2.5 py-0.5 rounded-md bg-brand-subtle text-brand border border-brand text-xs font-semibold">
                                {c.maxMarks} Marks
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCriteria(stg.id, c.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-danger"
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

      {}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle className="text-base font-semibold">Create Review Stage</DialogTitle></DialogHeader>
          <form onSubmit={stageForm.handleSubmit(handleCreateStage, (errs) => {
            const firstErr = Object.values(errs)[0]?.message;
            toast.error(firstErr ? String(firstErr) : 'Please fill in all required fields');
          })} className="space-y-4">
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
              <Button type="submit" isLoading={isCreatingStage} loadingText="Creating Stage..." id="submit-stage-btn" className="btn-primary">
                Create Stage
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!criteriaModal} onOpenChange={o => !o && setCriteriaModal(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle className="text-base font-semibold">Add Evaluation Criteria</DialogTitle></DialogHeader>
          <form onSubmit={criteriaForm.handleSubmit(handleAddCriteria)} className="space-y-4">
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
              <Button type="submit" isLoading={isAddingCriteria} loadingText="Adding Criteria..." id="submit-criteria-btn" className="btn-primary">
                Add Criteria
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <ConfirmDialog
        open={!!deleteStageId}
        onOpenChange={o => !o && setDeleteStageId(null)}
        title="Delete Review Stage"
        description="Are you sure? This will remove this review stage and all associated criteria."
        onConfirm={handleDeleteStage}
        variant="danger"
      />
    </div>
  );
}
