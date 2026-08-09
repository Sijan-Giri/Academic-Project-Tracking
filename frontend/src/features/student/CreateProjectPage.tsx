import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Save, CheckCircle2, AlertTriangle, FolderPlus, Users, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { useCreateProject } from '@/hooks/useCreateProject';

const projectInfoSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  domain: z.string().min(1, 'Please select a domain'),
  abstract: z.string().min(50, 'Abstract must be at least 50 characters'),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const domains = ['Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Cybersecurity', 'Data Science', 'Embedded Systems', 'Cloud Computing', 'Blockchain', 'Other'];

export default function CreateProjectPage() {
  const [step, setStep] = useState(1);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [guidePrefs, setGuidePrefs] = useState<string[]>(['', '', '']);
  const navigate = useNavigate();

  const {
    team,
    isLoading: teamLoading,
    createProject: createProjectMutate,
    isSubmitting: isPending,
  } = useCreateProject();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      title: '',
      domain: '',
      abstract: '',
      githubUrl: ''
    }
  });

  const availableGuides: any[] = [];

  const addKeyword = () => {
    const val = kwInput.trim();
    if (val && !keywords.includes(val)) {
      setKeywords([...keywords, val]);
      setKwInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const onFinalSubmit = (data: any) => {
    if (!team || team.status !== 'APPROVED') {
      toast.error('Your team must be approved by the coordinator before creating a project proposal.');
      return;
    }
    const cleanPrefs = guidePrefs.filter(Boolean);

    createProjectMutate({
      title: data.title,
      domain: data.domain,
      abstract: data.abstract,
      githubLink: data.githubUrl || undefined,
      keywords,
      teamId: team.id,
      guidePreferences: cleanPrefs.map((facultyProfileId, idx) => ({
        facultyProfileId,
        rank: idx + 1
      }))
    });
  };

  if (teamLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 bg-card border border-border rounded-xl" />
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  const isTeamApproved = team && team.status === 'APPROVED';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Create Project Proposal"
        subtitle="Submit your capstone project proposal details and rank mentor guide preferences."
      />

      {/* Team Validation Status Banner */}
      {!isTeamApproved ? (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h3 className="text-base font-semibold text-amber-900 dark:text-amber-300">
              Approved Team Required
            </h3>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed font-normal">
            {!team
              ? 'You are not part of any team. Please create or join a team first.'
              : `Your team "${team.name}" is currently ${team.status.toLowerCase()}. Wait for coordinator approval before proposing a project.`}
          </p>
          <Button onClick={() => navigate('/my-team')} size="sm" className="btn-primary mt-2">
            <Users className="w-4 h-4 mr-2" /> Go to Team Management
          </Button>
        </div>
      ) : (
        <>
          {/* Progress Stepper Wizard */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors',
                step === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
              )}>
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span className={cn('text-sm font-semibold', step === 1 ? 'text-foreground' : 'text-muted-foreground')}>
                1. Project Information
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors',
                step === 2 ? 'bg-indigo-600 text-white' : 'bg-secondary text-muted-foreground'
              )}>
                2
              </div>
              <span className={cn('text-sm font-semibold', step === 2 ? 'text-foreground' : 'text-muted-foreground')}>
                2. Guide Preferences
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit((data) => step === 1 ? setStep(2) : onFinalSubmit(data))}>
            {step === 1 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <FolderPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Project Details
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="title" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Project Title *</Label>
                  <Input id="title" placeholder="e.g. AI-Based Academic Project Tracking System" {...register('title')} />
                  {errors.title && <p className="text-xs text-rose-600 font-medium">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="domain" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Project Domain *</Label>
                  <select
                    id="domain"
                    {...register('domain')}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a domain</option>
                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.domain && <p className="text-xs text-rose-600 font-medium">{errors.domain.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="abstract" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Project Abstract *</Label>
                  <Textarea
                    id="abstract"
                    rows={5}
                    placeholder="Provide a comprehensive summary of problem statement, proposed methodology, and expected outcomes (min 50 characters)..."
                    {...register('abstract')}
                  />
                  {errors.abstract && <p className="text-xs text-rose-600 font-medium">{errors.abstract.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="githubUrl" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">GitHub / Repository URL (Optional)</Label>
                  <Input id="githubUrl" placeholder="https://github.com/username/repository" {...register('githubUrl')} />
                  {errors.githubUrl && <p className="text-xs text-rose-600 font-medium">{errors.githubUrl.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Keywords & Tech Stack</Label>
                  <div className="flex gap-2">
                    <Input
                      value={kwInput}
                      onChange={(e) => setKwInput(e.target.value)}
                      placeholder="e.g. React, Node.js, TensorFlow"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                    />
                    <Button type="button" onClick={addKeyword} variant="outline" className="btn-outline shrink-0">
                      Add Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {keywords.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-medium border border-border">
                        #{kw}
                        <Button variant="ghost" size="icon" type="button" onClick={() => removeKeyword(kw)} className="h-4 w-4 p-0 text-muted-foreground hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" className="btn-primary">
                    Next: Guide Preferences <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Rank Faculty Guide Preferences
                  </h3>
                  <p className="text-xs text-muted-foreground font-normal">Select up to 3 faculty guides in order of preference.</p>
                </div>

                <div className="space-y-4">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="space-y-1.5">
                      <Label className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Preference #{idx + 1}</Label>
                      <select
                        value={guidePrefs[idx]}
                        onChange={(e) => {
                          const updated = [...guidePrefs];
                          updated[idx] = e.target.value;
                          setGuidePrefs(updated);
                        }}
                        className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select Faculty Mentor...</option>
                        {availableGuides.map((g: any) => (
                          <option key={g.id} value={g.id}>
                            {g.user?.name || 'Faculty Member'} ({g.designation || 'Guide'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="btn-outline">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button type="submit" isLoading={isPending} loadingText="Submitting Proposal..." className="btn-primary">
                    <Save className="w-4 h-4 mr-2" /> Submit Proposal
                  </Button>
                </div>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
