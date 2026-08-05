import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, AlertCircle, CheckCircle2, RefreshCw, Copy, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import { getMyProjects } from '@/api/projects.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AbstractSkeleton } from '@/components/shared/Skeletons';

export default function AbstractPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data: projectRes, isLoading } = useQuery({
    queryKey: ['my-project'],
    queryFn: getMyProjects
  });

  if (isLoading) {
    return <AbstractSkeleton />;
  }

  const raw = projectRes as any;
  const projectList: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const project = projectList[0] ?? null;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Project Abstract Proposal" subtitle="View and track your capstone project abstract proposal." />
        <div className="flex flex-col items-center justify-center min-h-[45vh] bg-card border border-border rounded-xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No Project Proposal Found</h2>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm font-normal">
            Create a capstone project first to submit and view your project abstract.
          </p>
          <Button onClick={() => navigate('/my-project/create')} className="btn-primary">
            Create Project Proposal
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Project Abstract Proposal"
        subtitle="Detailed abstract summary, coordinator review feedback, and status."
      />

      {/* Main Metadata Banner Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {project.domain && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  {project.domain}
                </span>
              )}
              <StatusBadge status={project.status} type="project" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
              {project.title}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="btn-outline shrink-0 gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            {copied ? 'Copied' : 'Copy Abstract'}
          </Button>
        </div>

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {project.keywords.map((kw: string) => (
              <span key={kw} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-medium border border-border">
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Review Status Banners */}
      {isRejectedOrRevision && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Revision Requested</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed max-w-xl font-normal">
                {(project as any).abstractComments || project.rejectionReason || 'Please review coordinator comments and update your project abstract.'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/my-project')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium shrink-0 rounded-lg text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Revise Proposal
          </Button>
        </div>
      )}

      {project.status === 'ABSTRACT_SUBMITTED' && (
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-300 p-4 flex items-center gap-3 shadow-xs">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Under Coordinator Review</h4>
            <p className="text-xs mt-0.5 opacity-90 font-normal">
              Your abstract proposal has been submitted and is currently being evaluated by the academic coordinator.
            </p>
          </div>
        </div>
      )}

      {(project.status === 'ABSTRACT_APPROVED' || project.status === 'IN_PROGRESS' || project.status === 'COMPLETED') && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300 p-4 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Abstract Approved Officially</h4>
            <p className="text-xs mt-0.5 opacity-90 font-normal">
              Your abstract proposal was reviewed and approved. You are ready for upcoming review milestones.
            </p>
          </div>
        </div>
      )}

      {/* Abstract Content Box */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Abstract Document Body
          </h3>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-secondary text-muted-foreground border border-border">
            {wordCount} words
          </span>
        </div>

        <div className="rounded-lg bg-secondary/50 p-5 border border-border border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
          <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap font-normal">
            {project.abstract || 'No abstract text provided.'}
          </p>
        </div>
      </div>
    </div>
  );
}
