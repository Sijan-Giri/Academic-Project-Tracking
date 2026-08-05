import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Calendar, Upload, FileText, Clock, AlertCircle, X, FolderUp, Loader2, ArrowRight } from 'lucide-react';
import { getMilestones } from '@/api/milestones.api';
import { createSubmission } from '@/api/submissions.api';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import FileUploadZone from '@/components/shared/FileUploadZone';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function MilestonesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['my-milestones'],
    queryFn: getMilestones
  });

  const submitMutation = useMutation({
    mutationFn: (formData: FormData) => createSubmission(formData),
    onSuccess: () => {
      toast.success('Files submitted successfully!');
      setSelectedMilestone(null);
      setSelectedFiles([]);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['my-milestones'] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to upload files');
    }
  });

  const handleUploadSubmit = () => {
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
    submitMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
        <div className="h-64 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
      </div>
    );
  }

  const milestones = (res as any)?.data?.items || (res as any)?.items || (res as any)?.data || (Array.isArray(res) ? res : []);

  if (milestones.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Project Milestones" subtitle="Track your deliverables and deadline schedules." />
        <div className="flex flex-col items-center justify-center min-h-[50vh] dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm rounded-3xl p-8 text-center">
          <div className="w-20 h-20 dark:bg-indigo-500/20 bg-indigo-50 border dark:border-indigo-500/30 border-indigo-100 rounded-3xl flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold dark:text-white text-slate-900 mb-2">No Milestones Configured</h3>
          <p className="dark:text-gray-400 text-slate-500 max-w-md text-sm">
            Your project coordinator will configure academic review stage milestones soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Project Milestones & Deliverables"
        subtitle="Track review stage deadlines, required documentation, and submit milestone files."
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/my-project/submissions')}
            className="dark:border-white/10 border-slate-200 font-semibold rounded-xl"
          >
            View All Submissions <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        }
      />

      {/* Timeline List */}
      <div className="relative border-l-2 dark:border-white/10 border-slate-200 ml-4 md:ml-6 space-y-8 pb-8">
        {milestones.map((m: any) => {
          const title = m.name || m.title || 'Milestone';
          const deadlineDate = m.deadline ? new Date(m.deadline) : null;
          const isCompleted = m.status === 'APPROVED' || m.status === 'COMPLETED';
          const isOverdue = deadlineDate && deadlineDate < new Date() && !isCompleted;
          const requiredDocs = m.requiredDocuments || m.requiredDocs || [];

          return (
            <div key={m.id} className="relative pl-8 md:pl-10 group">
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 transition-all duration-300 z-10',
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/30'
                    : isOverdue
                    ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/30'
                    : 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/20 animate-pulse'
                )}
              />

              {/* Card */}
              <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-7 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-snug">
                      {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      {deadlineDate && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border',
                            isOverdue
                              ? 'dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 bg-rose-50 text-rose-700 border-rose-200'
                              : 'dark:bg-slate-500/20 dark:text-gray-300 dark:border-slate-500/30 bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-indigo-500" />}
                          Deadline: {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <StatusBadge status={m.status} type="milestone" />
                    </div>
                  </div>

                  {!isCompleted && (
                    <Button
                      onClick={() => {
                        setSelectedMilestone(m);
                        setSelectedFiles([]);
                        setNotes('');
                      }}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/20 shrink-0 rounded-xl"
                    >
                      <Upload className="w-4 h-4 mr-2" /> Upload Deliverables
                    </Button>
                  )}
                </div>

                {m.description && (
                  <p className="dark:text-gray-300 text-slate-600 text-sm mb-4 font-normal leading-relaxed">
                    {m.description}
                  </p>
                )}

                {/* Required docs checklist */}
                {requiredDocs.length > 0 && (
                  <div className="pt-4 border-t dark:border-white/10 border-slate-200/80">
                    <p className="dark:text-gray-400 text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                      Required Submissions:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {requiredDocs.map((doc: string) => (
                        <li
                          key={doc}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200/70 dark:text-gray-200 text-slate-700 text-xs font-medium"
                        >
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="truncate">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Deliverables Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="dark:bg-[#14161f] bg-white border dark:border-white/10 border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedMilestone(null)}
              className="absolute top-5 right-5 p-2 rounded-full dark:text-gray-400 dark:hover:text-white text-slate-500 hover:text-slate-900 dark:hover:bg-white/10 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FolderUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold dark:text-white text-slate-900">
                  Submit {selectedMilestone.name || selectedMilestone.title}
                </h3>
                <p className="text-xs dark:text-gray-400 text-slate-500 font-medium">Upload required project documentation.</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <FileUploadZone
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/zip': ['.zip'],
                  'application/x-zip-compressed': ['.zip'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                }}
                maxSize={25 * 1024 * 1024}
                onFilesSelected={(files) => setSelectedFiles(files)}
                multiple={true}
              />

              <div>
                <label className="block text-xs font-bold dark:text-gray-400 text-slate-600 uppercase tracking-wider mb-2">
                  Submission Notes (Optional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any comments or notes for your guide..."
                  className="w-full h-24 p-3 dark:bg-white/5 bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl text-sm dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedMilestone(null)}
                className="dark:text-gray-400 text-slate-600 rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={submitMutation.isPending || selectedFiles.length === 0}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/20 rounded-xl"
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Submit Deliverables
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
