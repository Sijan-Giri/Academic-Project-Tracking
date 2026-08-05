import { useQuery } from '@tanstack/react-query';
import { FileText, FolderGit2, Calendar, FileDown } from 'lucide-react';
import { getSubmissions, downloadFile } from '@/api/submissions.api';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';

export default function SubmissionsPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: getSubmissions
  });

  const handleDownload = async (fileId: string, originalName?: string) => {
    try {
      await downloadFile(fileId);
      toast.success(`Downloading ${originalName || 'file'}...`);
    } catch (_) {
      toast.error('Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 bg-card border border-border rounded-xl" />
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  const submissions = (res as any)?.data?.items || (res as any)?.items || (res as any)?.data || (Array.isArray(res) ? res : []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Submission History"
        subtitle="Review and download all uploaded project milestone deliverables and version history."
      />

      {/* Submissions Table / Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Uploaded Milestone Deliverables
          </h3>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            {submissions.length} Record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-secondary/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3">Milestone</th>
                <th className="px-5 py-3">Version</th>
                <th className="px-5 py-3">Submitted At</th>
                <th className="px-5 py-3">Attached Files</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Calendar className="w-8 h-8 text-muted-foreground opacity-60" />
                      <p className="font-semibold text-foreground text-sm">No Submissions Found</p>
                      <p className="text-xs text-muted-foreground max-w-sm font-normal">
                        You have not submitted deliverables for any project milestone yet.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub: any) => {
                  const milestoneTitle = sub.milestone?.name || sub.milestone?.title || 'Milestone';
                  const fileList: any[] = sub.files || [];
                  return (
                    <tr key={sub.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        {milestoneTitle}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-secondary border border-border text-foreground">
                          v{sub.version || 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs font-medium">
                        {new Date(sub.createdAt || sub.submittedAt || Date.now()).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {fileList.length === 0 ? (
                            <span className="text-xs text-muted-foreground font-normal">No files</span>
                          ) : (
                            fileList.map((file: any) => (
                              <button
                                key={file.id}
                                onClick={() => handleDownload(file.id, file.originalName)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-colors"
                                title={`Click to download ${file.originalName || 'file'}`}
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span className="max-w-[120px] truncate">{file.originalName || 'File'}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs text-muted-foreground text-xs truncate font-normal" title={sub.notes}>
                        {sub.notes || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {fileList.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(fileList[0].id, fileList[0].originalName)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 font-semibold rounded-md text-xs"
                          >
                            <FileDown className="w-4 h-4 mr-1.5" /> Download
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
