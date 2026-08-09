import { useState } from 'react';
import { Calendar, Upload, FileText, Clock, X, FolderUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import FileUploadZone from '@/components/shared/FileUploadZone';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMilestones } from '@/hooks/useMilestones';

import { MilestonesSkeleton } from '@/components/shared/Skeletons';

export default function MilestonesPage() {
  const navigate = useNavigate();
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');

  const { milestones, isLoading, uploadSubmission, isSubmitting } = useMilestones();

  const handleUploadSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('milestoneId', selectedMilestone.id);
    if (notes) formData.append('notes', notes);
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    try {
      await uploadSubmission(formData);
      setSelectedMilestone(null);
      setSelectedFiles([]);
      setNotes('');
    } catch (_) {}
  };

  if (isLoading) {
    return <MilestonesSkeleton />;
  }

  const milestonesList = milestones;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Milestone Deliverables"
        subtitle="Track required milestone documents, deadlines, and upload submission files."
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/my-project/submissions')}
            className="btn-outline"
          >
            <FileText className="w-4 h-4 mr-2" /> View History
          </Button>
        }
      />

      {milestonesList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Active Milestones Defined</h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mt-1 font-normal">
            Your academic department or project coordinator has not published milestone deadlines for this semester yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestonesList.map((m: any, idx: number) => {
            const isSubmitted = m.status === 'SUBMITTED' || m.status === 'APPROVED';
            const deadlineDate = m.deadline ? new Date(m.deadline) : null;
            const isOverdue = deadlineDate && deadlineDate < new Date() && !isSubmitted;

            return (
              <div
                key={m.id || idx}
                className={cn(
                  'rounded-xl border bg-card p-6 shadow-xs transition-all',
                  isOverdue
                    ? 'border-rose-200 dark:border-rose-500/30'
                    : 'border-border'
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-secondary border border-border text-foreground">
                        Phase #{m.order || idx + 1}
                      </span>
                      <StatusBadge status={m.status || 'NOT_STARTED'} type="milestone" />
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                          Overdue Deadline
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{m.name}</h3>
                    {m.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 font-normal leading-relaxed">{m.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      onClick={() => {
                        setSelectedMilestone(m);
                        setSelectedFiles([]);
                        setNotes('');
                      }}
                      className={cn(
                        'btn-primary text-xs',
                        isSubmitted && 'btn-outline'
                      )}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isSubmitted ? 'Resubmit Files' : 'Upload Deliverables'}
                    </Button>
                  </div>
                </div>

                {/* Requirements & Deadline Info */}
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-normal">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>
                      Deadline:{' '}
                      <strong className="text-foreground font-semibold">
                        {deadlineDate ? deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No fixed date'}
                      </strong>
                    </span>
                  </div>

                  {m.requiredDocuments && m.requiredDocuments.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-muted-foreground">Required:</span>
                      {m.requiredDocuments.map((doc: string) => (
                        <span key={doc} className="px-2 py-0.5 rounded-md bg-secondary text-foreground font-medium border border-border text-[11px]">
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Deliverables Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FolderUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-semibold text-foreground">Upload Milestone Files</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMilestone(null)}
                className="h-8 w-8 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-3 font-normal">
                Submitting deliverables for: <strong className="text-foreground font-semibold">{selectedMilestone.name}</strong>
              </p>

              <FileUploadZone
                onFilesSelected={(files) => setSelectedFiles(files)}
                multiple={true}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submission Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include version notes or comments for your reviewer..."
                rows={2}
                className="w-full rounded-lg border border-input bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedMilestone(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={selectedFiles.length === 0}
                isLoading={isSubmitting}
                loadingText="Uploading Deliverables..."
                className="btn-primary"
              >
                <Upload className="w-4 h-4 mr-2" /> Submit Deliverables
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
