import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ArrowLeft, Lock, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';
import { useEvaluationForm } from '@/hooks/useEvaluationForm';

import { FormSkeleton } from '@/components/shared/Skeletons';

export default function EvaluationFormPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state: any) => state.user);
  
  const { schedule, criteriaList: criteria, submitEvaluation, isSubmitting } = useEvaluationForm(scheduleId || '');
  const existingEval: any = null;

  const [marks, setMarks] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState('');

  const isLocked = existingEval?.isLocked;
  const canLock = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

  useEffect(() => {
    if (existingEval) {
      const initialMarks: Record<string, number> = {};
      const initialRemarks: Record<string, string> = {};
      existingEval.scores?.forEach((score: any) => {
        const cId = score.criteriaId || score.criterionId;
        initialMarks[cId] = score.marks ?? score.mark ?? 0;
        initialRemarks[cId] = score.remarks || score.remark || '';
      });
      setMarks(initialMarks);
      setRemarks(initialRemarks);
      setOverallFeedback(existingEval.feedback || existingEval.overallFeedback || '');
    }
  }, [existingEval]);

  const totalMarks = Object.values(marks).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  const maxTotal = criteria.reduce((acc: number, curr: any) => acc + (curr.maxMarks || 0), 0);
  const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;

  let grade = 'F';
  let gradeColor = 'text-rose-600 dark:text-rose-400';
  if (percentage >= 90) { grade = 'A+'; gradeColor = 'text-emerald-600 dark:text-emerald-400'; }
  else if (percentage >= 80) { grade = 'A'; gradeColor = 'text-emerald-600 dark:text-emerald-400'; }
  else if (percentage >= 70) { grade = 'B'; gradeColor = 'text-indigo-600 dark:text-indigo-400'; }
  else if (percentage >= 60) { grade = 'C'; gradeColor = 'text-amber-600 dark:text-amber-400'; }
  else if (percentage >= 50) { grade = 'D'; gradeColor = 'text-orange-600 dark:text-orange-400'; }

  const handleSave = async () => {
    const scores = criteria.map((c: any) => ({
      criteriaId: c.id,
      marks: Number(marks[c.id]) || 0,
      remarks: remarks[c.id] || '',
    }));
    try {
      await submitEvaluation({
        scheduleId,
        projectId: schedule?.projectId,
        reviewStageId: schedule?.reviewStageId,
        scores,
        feedback: overallFeedback,
      });
    } catch (_) {}
  };

  if (!schedule) return <FormSkeleton />;

  const dateVal = schedule.scheduledAt || (schedule as any).date;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Evaluation Form</h1>
          <p className="text-xs text-muted-foreground font-normal">Score student performance based on established rubrics.</p>
        </div>
        {isLocked && (
          <div className="ml-auto flex items-center gap-2 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 px-3 py-1 rounded-md border border-rose-200 dark:border-rose-500/30 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" /> Locked Record
          </div>
        )}
      </div>

      {isLocked && (
        <div className="bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>This evaluation form has been finalized and locked. Edits are disabled. Contact your coordinator to modify scores.</p>
        </div>
      )}

      {/* Project Info Header */}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold inline-block mb-2">
              {schedule.reviewStage?.name || 'Review Stage'}
            </span>
            <h2 className="text-xl font-bold text-foreground mb-1 tracking-tight">{schedule.project?.title || 'Project Title'}</h2>
            <p className="text-muted-foreground text-xs font-normal line-clamp-2">{schedule.project?.abstract || 'No abstract available.'}</p>
          </div>
          <div className="md:text-right space-y-1.5 text-xs">
            <p className="text-muted-foreground font-normal"><span className="text-foreground font-semibold">Team:</span> {(schedule as any).team?.name || schedule.project?.team?.name}</p>
            <p className="text-muted-foreground font-normal"><span className="text-foreground font-semibold">Date:</span> {dateVal ? format(new Date(dateVal), 'MMM d, yyyy · h:mm a') : 'TBD'}</p>
            <p className="text-muted-foreground font-normal"><span className="text-foreground font-semibold">Venue:</span> {schedule.venue || 'TBA'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Rubric Table */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold">Evaluation Rubric & Scoring</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow>
                  <TableHead className="w-[35%] px-5">Criterion</TableHead>
                  <TableHead className="w-[12%] text-center">Max Marks</TableHead>
                  <TableHead className="w-[18%]">Marks Awarded</TableHead>
                  <TableHead className="w-[35%] px-5">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="px-5">
                      <p className="font-semibold text-foreground text-xs">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground font-normal mt-0.5">{c.description}</p>
                    </TableCell>
                    <TableCell className="text-center text-foreground font-semibold text-xs">{c.maxMarks}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min={0} 
                        max={c.maxMarks}
                        value={marks[c.id] === undefined ? '' : marks[c.id]}
                        onChange={(e) => setMarks({...marks, [c.id]: Number(e.target.value)})}
                        disabled={isLocked}
                        className="input-field text-xs h-9"
                      />
                    </TableCell>
                    <TableCell className="px-5">
                      <Input 
                        placeholder="Optional evaluator remarks..."
                        value={remarks[c.id] || ''}
                        onChange={(e) => setRemarks({...remarks, [c.id]: e.target.value})}
                        disabled={isLocked}
                        className="input-field text-xs h-9"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="m-5 p-5 bg-secondary/50 rounded-xl border border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Evaluation Score</p>
              <div className="text-3xl font-bold mt-1 tracking-tight">
                <span className="text-foreground">{totalMarks}</span>
                <span className="text-muted-foreground text-xl font-normal"> / {maxTotal}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Computed Grade</p>
              <div className={`text-4xl font-bold mt-1 tracking-tight ${gradeColor}`}>{grade}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold">Overall Qualitative Feedback</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea 
            placeholder="Provide comprehensive constructive feedback for the team..."
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            disabled={isLocked}
            className="input-field min-h-[140px]"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        {existingEval && canLock && !isLocked && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Lock Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Lock Evaluation Record?</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground font-normal">This action will finalize the marks. Once locked, no evaluators can edit scores for this presentation slot.</p>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button 
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
                >
                  Confirm & Lock
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        <Button 
          onClick={handleSave} 
          disabled={isLocked}
          isLoading={isSubmitting}
          loadingText="Submitting Evaluation..."
          className="btn-primary px-6"
        >
          <Save className="w-4 h-4 mr-2" />
          Save & Submit Marks
        </Button>
      </div>
    </div>
  );
}
