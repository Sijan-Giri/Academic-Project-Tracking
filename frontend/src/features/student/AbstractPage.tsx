import { useQuery } from '@tanstack/react-query';
import { FileText, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { getMyProjects } from '@/api/projects.api';
import { useNavigate } from 'react-router-dom';

export default function AbstractPage() {
  const navigate = useNavigate();
  const { data: projectRes, isLoading } = useQuery({
    queryKey: ['my-project'],
    queryFn: getMyProjects
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-white/5 rounded-2xl border border-white/10" />;

  const project = Array.isArray(projectRes?.data) ? projectRes?.data[0] : (projectRes?.data || (Array.isArray(projectRes) ? projectRes[0] : projectRes));
  if (!project) return <div className="text-gray-400 p-6 text-center">No project found. Create one first.</div>;

  const isRejectedOrRevision = project.status === 'ABSTRACT_REJECTED' || project.abstractStatus === 'REVISION_NEEDED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Project Abstract</h1>
          <p className="text-gray-400">Current submission status</p>
        </div>
        <StatusBadge status={project.status || project.abstractStatus || 'ABSTRACT_SUBMITTED'} type="project" />
      </div>

      {isRejectedOrRevision && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-orange-400 font-medium text-lg">Revision Requested</h4>
              <p className="text-orange-400/80 mt-1 mb-3">{project.abstractComments || 'Please revise your abstract according to the guidelines.'}</p>
            </div>
          </div>
          <Button onClick={() => navigate('/student/my-project/edit')} className="bg-orange-500 hover:bg-orange-600 text-white shrink-0">
            <RefreshCw className="w-4 h-4 mr-2" /> Resubmit Abstract
          </Button>
        </div>
      )}

      {project.abstractStatus === 'ABSTRACT_SUBMITTED' && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-indigo-400" />
          <p className="text-indigo-200">Abstract is currently under review by the coordinator.</p>
        </div>
      )}

      {project.abstractStatus === 'ABSTRACT_APPROVED' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-200">Abstract has been approved!</p>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
        <h3 className="text-lg font-semibold text-white mb-4">Abstract Content</h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {project.abstract}
          </p>
        </div>
      </div>
    </div>
  );
}
