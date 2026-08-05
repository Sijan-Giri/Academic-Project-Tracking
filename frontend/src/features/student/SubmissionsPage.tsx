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
        <div className="h-44 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
        <div className="h-64 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
      </div>
    );
  }

  const submissions = (res as any)?.data?.items || (res as any)?.items || (res as any)?.data || (Array.isArray(res) ? res : []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Submission History"
        subtitle="Review and download all uploaded project milestone deliverables and version history."
      />

      {/* Submissions Table / Card Container */}
      <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-6 md:p-8 border-b dark:border-white/10 border-slate-200/80 flex items-center justify-between">
          <h3 className="text-xl font-extrabold dark:text-white text-slate-900 flex items-center gap-2.5">
            <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Uploaded Milestone Files
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold dark:bg-indigo-500/20 dark:text-indigo-300 bg-indigo-50 text-indigo-700 border border-indigo-200">
            {submissions.length} Submissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-gray-300 text-slate-700">
            <thead className="dark:bg-white/5 bg-slate-100/80 text-xs font-bold uppercase tracking-wider dark:text-gray-400 text-slate-600 border-b dark:border-white/10 border-slate-200">
              <tr>
                <th className="px-6 py-4">Milestone</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Submitted At</th>
                <th className="px-6 py-4">Attached Files</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-white/10 divide-slate-200/80">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Calendar className="w-10 h-10 dark:text-gray-500 text-slate-400" />
                      <p className="font-semibold dark:text-gray-400 text-slate-500 text-base">No Submissions Found</p>
                      <p className="text-xs dark:text-gray-500 text-slate-400 max-w-sm">
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
                    <tr key={sub.id} className="dark:hover:bg-white/5 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold dark:text-white text-slate-900">
                        {milestoneTitle}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold dark:bg-indigo-500/20 dark:text-indigo-300 bg-indigo-50 text-indigo-700 border border-indigo-200">
                          v{sub.version || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium dark:text-gray-300 text-slate-600 text-xs">
                        {new Date(sub.createdAt || sub.submittedAt || Date.now()).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {fileList.length === 0 ? (
                            <span className="text-xs text-slate-400 font-medium">No files</span>
                          ) : (
                            fileList.map((file: any) => (
                              <button
                                key={file.id}
                                onClick={() => handleDownload(file.id, file.originalName)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg dark:bg-white/5 dark:text-gray-200 bg-slate-100 text-slate-700 dark:hover:bg-white/10 hover:bg-slate-200 border border-slate-200 text-xs font-semibold transition-colors"
                                title={`Click to download ${file.originalName || 'file'}`}
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span className="max-w-[120px] truncate">{file.originalName || 'File'}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs font-medium dark:text-gray-300 text-slate-600 text-xs truncate" title={sub.notes}>
                        {sub.notes || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {fileList.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(fileList[0].id, fileList[0].originalName)}
                            className="dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl text-xs"
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
