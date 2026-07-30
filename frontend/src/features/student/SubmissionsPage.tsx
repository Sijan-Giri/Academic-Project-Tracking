import { useQuery } from '@tanstack/react-query';
import { Download, FileText, ChevronDown } from 'lucide-react';
import { getMySubmissions } from '@/api/student.api';
import { Button } from '@/components/ui/button';

export default function SubmissionsPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: getMySubmissions
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-white/5 rounded-2xl border border-white/10" />;

  const submissions = res?.data || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Submission History</h1>
        <p className="text-gray-400">View and download all your past milestone submissions.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/20 text-gray-400 uppercase text-xs border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Milestone</th>
                <th className="px-6 py-4 font-medium">Version</th>
                <th className="px-6 py-4 font-medium">Submitted At</th>
                <th className="px-6 py-4 font-medium">Files</th>
                <th className="px-6 py-4 font-medium">Notes</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{sub.milestone?.title || 'Unknown Milestone'}</td>
                    <td className="px-6 py-4">v{sub.version}</td>
                    <td className="px-6 py-4">{new Date(sub.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
                        <FileText className="w-3.5 h-3.5" /> {sub.files?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={sub.notes}>{sub.notes || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
