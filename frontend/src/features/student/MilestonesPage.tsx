import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Calendar, Upload, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getProjectMilestones, createSubmission } from '@/api/student.api';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import toast from 'react-hot-toast';

export default function MilestonesPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const { data: res, isLoading } = useQuery({
    queryKey: ['my-milestones'],
    queryFn: getProjectMilestones
  });

  const uploadMut = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      toast.success('Files submitted successfully');
      setSelectedMilestone(null);
      queryClient.invalidateQueries({ queryKey: ['my-milestones'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Upload failed')
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-white/5 rounded-2xl border border-white/10" />;

  const milestones = res?.data || [];

  if (milestones.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
        <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Milestones Yet</h3>
        <p className="text-gray-400">The coordinator will add milestones for your project soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Project Milestones</h1>
        <p className="text-gray-400">Track your progress and submit required documents.</p>
      </div>

      <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-8 pb-8">
        {milestones.map((m: any) => {
          const isOverdue = new Date(m.deadline) < new Date() && m.status !== 'COMPLETED';
          return (
            <div key={m.id} className="relative pl-8 md:pl-10">
              <div className={`absolute -left-2 top-2 w-4 h-4 rounded-full border-2 ${
                m.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-400' :
                isOverdue ? 'bg-red-500 border-red-400' : 'bg-indigo-500 border-indigo-400'
              }`} />
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{m.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                        {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        {new Date(m.deadline).toLocaleDateString()}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                  {m.status !== 'COMPLETED' && (
                    <Button onClick={() => setSelectedMilestone(m)} className="bg-indigo-500 hover:bg-indigo-600 text-white shrink-0">
                      <Upload className="w-4 h-4 mr-2" /> Submit Files
                    </Button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-sm mb-3">Required Documents:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.requiredDocs?.map((doc: string) => (
                      <li key={doc} className="flex items-center gap-2 text-gray-300 text-sm">
                        <FileText className="w-4 h-4 text-indigo-400" /> {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Basic Upload Dialog Simulation (Usually implemented with Radix Dialog) */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d24] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Submit for {selectedMilestone.title}</h3>
            <p className="text-gray-400 text-sm mb-6">Upload all required documents packaged in a zip file or as individual PDFs.</p>
            
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center mb-6 hover:border-indigo-500/50 transition-colors bg-white/5">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-white text-sm">Drag & drop files here, or click to select</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSelectedMilestone(null)} className="text-gray-400 hover:text-white">Cancel</Button>
              <Button onClick={() => {
                toast.success('File upload simulated successfully!');
                setSelectedMilestone(null);
              }} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
