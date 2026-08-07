import { useState } from 'react';
import { FileText, FolderGit2, Calendar, Download, Trash2, Loader2 } from 'lucide-react';
import { downloadFile, deleteFile } from '@/api/submissions.api';
import PageHeader from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared';
import toast from 'react-hot-toast';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useQueryClient } from '@tanstack/react-query';
import { SubmissionsSkeleton } from '@/components/shared/Skeletons';

export default function SubmissionsPage() {
  const { submissions, isLoading } = useSubmissions();
  const queryClient = useQueryClient();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDownload = async (fileId: string, originalName?: string) => {
    try {
      setDownloadingId(fileId);
      await downloadFile(fileId, originalName);
      toast.success(`Downloading ${originalName || 'file'}...`);
    } catch (_) {
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  const requestDelete = (fileId: string, originalName: string) => {
    setPendingDelete({ id: fileId, name: originalName });
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeletingId(pendingDelete.id);
      await deleteFile(pendingDelete.id);
      toast.success('File deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <SubmissionsSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Submission History"
        subtitle="Review, download, and manage all uploaded project milestone deliverables and version history."
      />

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(v) => { if (!deletingId) setConfirmOpen(v); }}
        onConfirm={confirmDelete}
        isLoading={!!deletingId}
        loadingLabel="Deleting..."
        title="Delete File"
        description={`Are you sure you want to permanently delete "${pendingDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete File"
        variant="danger"
      />

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Uploaded Milestone Deliverables
          </h3>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            {submissions.length} Record(s)
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-3">
            <Calendar className="w-10 h-10 text-muted-foreground opacity-50 mx-auto" />
            <p className="font-semibold text-foreground text-sm">No Submissions Found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto font-normal">
              You have not submitted deliverables for any project milestone yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {submissions.map((sub: any) => {
              const milestoneTitle = sub.milestone?.name || 'Milestone';
              const fileList: any[] = sub.files || [];
              const submittedAt = new Date(sub.submittedAt || sub.createdAt || Date.now()).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
              });

              return (
                <div key={sub.id} className="p-5 hover:bg-secondary/30 transition-colors space-y-3">
                  {/* Submission header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {milestoneTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-secondary border border-border text-foreground">
                        v{sub.version || 1}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">{submittedAt}</span>
                    </div>
                    {sub.notes && (
                      <span className="text-xs text-muted-foreground italic max-w-xs truncate">
                        "{sub.notes}"
                      </span>
                    )}
                  </div>

                  {/* File list */}
                  {fileList.length === 0 ? (
                    <p className="text-xs text-muted-foreground pl-1 font-normal">No files attached.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {fileList.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border hover:border-indigo-500/30 transition-all"
                        >
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span
                            className="text-xs font-medium text-foreground max-w-[160px] truncate"
                            title={file.originalName}
                          >
                            {file.originalName || 'File'}
                          </span>
                          {file.sizeBytes ? (
                            <span className="text-[10px] text-muted-foreground font-normal shrink-0">
                              {(file.sizeBytes / 1024).toFixed(0)} KB
                            </span>
                          ) : null}

                          {/* Download */}
                          <button
                            onClick={() => handleDownload(file.id, file.originalName)}
                            disabled={downloadingId === file.id}
                            title="Download file"
                            className="ml-1 p-1 rounded text-muted-foreground hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
                          >
                            {downloadingId === file.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Download className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => requestDelete(file.id, file.originalName || 'this file')}
                            disabled={deletingId === file.id}
                            title="Delete file"
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                          >
                            {deletingId === file.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
