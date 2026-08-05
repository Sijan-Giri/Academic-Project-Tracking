import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, AlertCircle, CheckCircle2, RefreshCw, Copy, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import { getMyProjects } from '@/api/projects.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AbstractPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data: projectRes, isLoading } = useQuery({
    queryKey: ['my-project'],
    queryFn: getMyProjects
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
        <div className="h-64 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
      </div>
    );
  }

  const raw = projectRes as any;
  const projectList: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const project = projectList[0] ?? null;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Project Abstract" subtitle="View and track your capstone project abstract proposal." />
        <div className="flex flex-col items-center justify-center min-h-[50vh] dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm rounded-3xl p-8 text-center">
          <div className="w-20 h-20 dark:bg-indigo-500/20 bg-indigo-50 border dark:border-indigo-500/30 border-indigo-100 rounded-3xl flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-extrabold dark:text-white text-slate-900 mb-2">No Project Found</h2>
          <p className="dark:text-gray-400 text-slate-500 mb-6 max-w-md text-sm">
            Create a capstone project first to submit and view your project abstract.
          </p>
          <Button
            onClick={() => navigate('/my-project/create')}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/20 rounded-xl"
          >
            Create Project
          </Button>
        </div>
      </div>
    );
  }

  const isRejectedOrRevision = project.status === 'ABSTRACT_REJECTED' || (project as any).abstractStatus === 'REVISION_NEEDED';
  const wordCount = project.abstract ? project.abstract.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    if (project.abstract) {
      navigator.clipboard.writeText(project.abstract);
      setCopied(true);
      toast.success('Abstract copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Project Abstract Proposal"
        subtitle="Detailed abstract summary, coordinator review feedback, and status."
      />

      {/* Main Metadata Banner Card */}
      <div className="relative overflow-hidden rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              {project.domain && (
                <span className="px-3 py-1 rounded-full text-xs font-bold dark:bg-indigo-500/20 dark:text-indigo-300 bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {project.domain}
                </span>
              )}
              <StatusBadge status={project.status} type="project" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-snug">
              {project.title}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="dark:border-white/10 border-slate-300 dark:bg-white/5 bg-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 dark:text-white text-slate-900 font-bold shrink-0 rounded-xl"
          >
            {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />}
            {copied ? 'Copied' : 'Copy Abstract'}
          </Button>
        </div>

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {project.keywords.map((kw: string) => (
              <span key={kw} className="px-3 py-1 rounded-lg dark:bg-white/5 dark:text-gray-300 dark:border-white/10 bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/70">
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Review Status Banners */}
      {isRejectedOrRevision && (
        <div className="rounded-2xl dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 bg-amber-50 border border-amber-200 text-amber-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-base">Revision Requested</h4>
              <p className="text-xs mt-1 opacity-90 leading-relaxed max-w-xl">
                {(project as any).abstractComments || project.rejectionReason || 'Please review coordinator comments and update your project abstract.'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/my-project')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-500/20 shrink-0 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Revise Proposal
          </Button>
        </div>
      )}

      {project.status === 'ABSTRACT_SUBMITTED' && (
        <div className="rounded-2xl dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300 bg-indigo-50 border border-indigo-200 text-indigo-900 p-5 flex items-center gap-3.5 shadow-xs">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
          <div>
            <h4 className="font-bold text-base">Under Coordinator Review</h4>
            <p className="text-xs mt-0.5 opacity-90">
              Your abstract proposal has been submitted and is currently being evaluated by the academic coordinator.
            </p>
          </div>
        </div>
      )}

      {(project.status === 'ABSTRACT_APPROVED' || project.status === 'IN_PROGRESS' || project.status === 'COMPLETED') && (
        <div className="rounded-2xl dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 flex items-center gap-3.5 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-base">Abstract Approved Officially</h4>
            <p className="text-xs mt-0.5 opacity-90">
              Your abstract proposal was reviewed and approved. You are ready for upcoming review milestones.
            </p>
          </div>
        </div>
      )}

      {/* Abstract Content Box */}
      <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200/80 pb-4 mb-6">
          <h3 className="text-lg font-extrabold dark:text-white text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Abstract Document Body
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold dark:bg-white/5 dark:text-gray-300 bg-slate-100 text-slate-600 border border-slate-200">
            {wordCount} words
          </span>
        </div>

        <div className="rounded-2xl dark:bg-black/20 bg-slate-50 p-6 border dark:border-white/5 border-slate-200/70 border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
          <p className="dark:text-gray-300 text-slate-700 leading-relaxed text-base whitespace-pre-wrap font-normal">
            {project.abstract || 'No abstract text provided.'}
          </p>
        </div>
      </div>
    </div>
  );
}
