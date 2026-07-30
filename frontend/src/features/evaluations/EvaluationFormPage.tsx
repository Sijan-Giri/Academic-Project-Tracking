import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ArrowLeft, Lock, Save, AlertTriangle } from 'lucide-react';
import { getSchedule, getStageCriteria, getEvaluations, createEvaluation, updateEvaluation, lockEvaluation } from '@/api/evaluations.api';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';

export default function EvaluationFormPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state: any) => state.user);
  
  const { data: schedule } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => getSchedule(scheduleId!),
    enabled: !!scheduleId
  });

  const { data: criteria = [] } = useQuery({
    queryKey: ['criteria', schedule?.reviewStageId],
    queryFn: () => getStageCriteria(schedule?.reviewStageId!),
    enabled: !!schedule?.reviewStageId
  });

  const { data: existingEval } = useQuery({
    queryKey: ['evaluations', schedule?.projectId, schedule?.reviewStageId, user?.id],
    queryFn: () => getEvaluations({ projectId: schedule?.projectId, reviewStageId: schedule?.reviewStageId, evaluatorId: user?.id }),
    enabled: !!schedule && !!user
  });

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
        initialMarks[score.criterionId] = score.mark;
        initialRemarks[score.criterionId] = score.remark;
      });
      setMarks(initialMarks);
      setRemarks(initialRemarks);
      setOverallFeedback(existingEval.overallFeedback || '');
    }
  }, [existingEval]);

  const totalMarks = Object.values(marks).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  const maxTotal = criteria.reduce((acc: number, curr: any) => acc + (curr.maxMarks || 0), 0);
  const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;

  let grade = 'F';
  let gradeColor = 'text-red-500';
  if (percentage >= 90) { grade = 'A+'; gradeColor = 'text-emerald-400'; }
  else if (percentage >= 80) { grade = 'A'; gradeColor = 'text-emerald-500'; }
  else if (percentage >= 70) { grade = 'B'; gradeColor = 'text-blue-400'; }
  else if (percentage >= 60) { grade = 'C'; gradeColor = 'text-yellow-400'; }
  else if (percentage >= 50) { grade = 'D'; gradeColor = 'text-orange-400'; }

  const saveMutation = useMutation({
    mutationFn: (data: any) => existingEval ? updateEvaluation(existingEval.id, data) : createEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      // show toast logic here
    }
  });

  const lockMutation = useMutation({
    mutationFn: () => lockEvaluation(existingEval.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    }
  });

  const handleSave = () => {
    const scores = criteria.map((c: any) => ({
      criterionId: c.id,
      mark: marks[c.id] || 0,
      remark: remarks[c.id] || ''
    }));
    saveMutation.mutate({
      scheduleId,
      projectId: schedule?.projectId,
      reviewStageId: schedule?.reviewStageId,
      scores,
      overallFeedback
    });
  };

  if (!schedule) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117] max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          Evaluation Form
        </h1>
        {isLocked && (
          <div className="ml-auto flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20 text-sm font-medium">
            <Lock className="w-4 h-4" /> Locked
          </div>
        )}
      </div>

      {isLocked && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>This evaluation is locked. No further edits are allowed. Contact the coordinator if you need to make changes.</p>
        </div>
      )}

      {/* Project Info Header */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-indigo-400 font-medium mb-1">{schedule.reviewStage?.name || 'Review Stage'}</p>
            <h2 className="text-2xl font-bold mb-2">{schedule.project?.title || 'Project Title'}</h2>
            <p className="text-slate-400 text-sm line-clamp-2">{schedule.project?.abstract || 'No abstract available.'}</p>
          </div>
          <div className="md:text-right space-y-2">
            <p className="text-slate-300"><span className="text-slate-500">Team:</span> {schedule.team?.name}</p>
            <p className="text-slate-300"><span className="text-slate-500">Date:</span> {format(new Date(schedule.date), 'MMM d, yyyy h:mm a')}</p>
            <p className="text-slate-300"><span className="text-slate-500">Venue:</span> {schedule.venue}</p>
          </div>
        </CardContent>
      </Card>

      {/* Rubric Table */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>Evaluation Rubric</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-[30%]">Criterion</TableHead>
                  <TableHead className="w-[10%] text-center">Max Marks</TableHead>
                  <TableHead className="w-[15%]">Marks Awarded</TableHead>
                  <TableHead className="w-[45%]">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((c: any) => (
                  <TableRow key={c.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <p className="font-medium text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                    </TableCell>
                    <TableCell className="text-center text-slate-400 font-medium">{c.maxMarks}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min={0} 
                        max={c.maxMarks}
                        value={marks[c.id] === undefined ? '' : marks[c.id]}
                        onChange={(e) => setMarks({...marks, [c.id]: Number(e.target.value)})}
                        disabled={isLocked}
                        className="bg-black/20 border-white/10 text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        placeholder="Optional remarks..."
                        value={remarks[c.id] || ''}
                        onChange={(e) => setRemarks({...remarks, [c.id]: e.target.value})}
                        disabled={isLocked}
                        className="bg-black/20 border-white/10 text-white"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 p-6 bg-black/20 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-slate-400 font-medium">Total Score</p>
              <div className="text-4xl font-bold mt-1">
                <span className="text-white">{totalMarks}</span>
                <span className="text-slate-600 text-2xl"> / {maxTotal}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-medium">Computed Grade</p>
              <div className={`text-5xl font-bold mt-1 ${gradeColor}`}>{grade}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Provide comprehensive feedback for the team..."
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            disabled={isLocked}
            className="min-h-[150px] bg-black/20 border-white/10 text-white"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pb-12">
        {existingEval && canLock && !isLocked && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <Lock className="w-4 h-4 mr-2" /> Lock Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e1e2e] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Lock this evaluation?</DialogTitle>
              </DialogHeader>
              <p className="text-slate-400">This action cannot be undone. Once locked, no evaluator can modify the marks or remarks for this schedule.</p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={() => lockMutation.mutate()} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={lockMutation.isPending}
                >
                  Confirm Lock
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        <Button 
          onClick={handleSave} 
          disabled={isLocked || saveMutation.isPending}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : existingEval ? 'Update Evaluation' : 'Submit Evaluation'}
        </Button>
      </div>
    </div>
  );
}
