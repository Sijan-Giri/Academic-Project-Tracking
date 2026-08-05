import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Loader2, Save, CheckCircle2, AlertTriangle, FolderPlus, Users, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/shared/PageHeader';
import { createProject } from '@/api/projects.api';
import { getMyTeam } from '@/api/teams.api';
import { getAvailableGuides } from '@/api/guides.api';
import { cn } from '@/lib/utils';

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

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      title: '',
      domain: '',
      abstract: '',
      githubUrl: ''
    }
  });

  const { data: teamRes, isLoading: teamLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
    retry: false,
  });

  const { data: guidesRes } = useQuery({ queryKey: ['available-guides'], queryFn: getAvailableGuides });

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('Project created successfully!');
      navigate('/my-project');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create project');
    }
  });

  // Extract the actual team object
  const team = (teamRes as any)?.data ?? teamRes ?? null;

  const onSubmit = (formData: any) => {
    if (!team?.id) {
      toast.error('You must be part of an approved team to create a project');
      setStep(2);
      return;
    }
    if (team.status !== 'APPROVED') {
      toast.error('Your team must be approved before creating a project');
      setStep(2);
      return;
    }
    mutate({
      title: formData.title,
      domain: formData.domain,
      abstract: formData.abstract,
      githubLink: formData.githubUrl || undefined,
      keywords,
      teamId: team.id,
      semesterId: team.semesterId || undefined,
      guidePreferences: guidePrefs.filter(Boolean).map((id, idx) => ({ facultyProfileId: id, rank: idx + 1 })),
    } as any);
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && kwInput.trim() && !keywords.includes(kwInput.trim())) {
      e.preventDefault();
      setKeywords([...keywords, kwInput.trim()]);
      setKwInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const canProceedFromStep2 = team?.status === 'APPROVED';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Create New Project Proposal"
        subtitle="Submit project metadata, team details, and rank your faculty guide preferences."
      />

      {/* Progress Stepper Bar */}
      <div className="relative rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between relative max-w-lg mx-auto">
          <div className="absolute left-0 top-1/2 w-full h-1 dark:bg-white/10 bg-slate-200 -translate-y-1/2 rounded-full z-0" />
          <div
            className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-indigo-600 to-violet-600 -translate-y-1/2 rounded-full z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {[
            { num: 1, label: 'Project Info', icon: FolderPlus },
            { num: 2, label: 'Team Status', icon: Users },
            { num: 3, label: 'Guide Prefs', icon: Award },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-500/20'
                      : 'dark:bg-slate-800 dark:text-gray-400 dark:border-white/10 bg-slate-100 text-slate-500 border border-slate-200'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    'absolute -bottom-6 text-xs whitespace-nowrap font-bold tracking-tight',
                    isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : isActive
                      ? 'dark:text-gray-300 text-slate-700'
                      : 'dark:text-gray-500 text-slate-400'
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <form onSubmit={step === 3 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); handleSubmit(() => setStep(step + 1))(e); }}>

          {/* STEP 1: Project Information */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b dark:border-white/10 border-slate-200/80 pb-4">
                <h3 className="text-xl font-extrabold dark:text-white text-slate-900">Step 1: Project Overview</h3>
                <p className="text-xs dark:text-gray-400 text-slate-500 font-medium">Provide essential project title, technical domain, and summary abstract.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">
                  Project Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g. AI-Powered Academic Project Tracking & Evaluation System"
                  className="h-11 rounded-xl dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 dark:text-white text-slate-900 placeholder:text-slate-400"
                />
                {errors.title && <p className="text-rose-500 text-xs font-semibold">{errors.title.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">
                  Domain Category <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="domain"
                  {...register('domain')}
                  className="flex h-11 w-full rounded-xl border dark:border-white/10 border-slate-200 dark:bg-[#14161f] bg-slate-50 px-3 py-2 text-sm dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="" className="dark:bg-[#14161f] dark:text-gray-400 bg-white text-slate-400">Select Domain Category</option>
                  {domains.map(d => (
                    <option key={d} value={d} className="dark:bg-[#14161f] dark:text-white bg-white text-slate-900">{d}</option>
                  ))}
                </select>
                {errors.domain && <p className="text-rose-500 text-xs font-semibold">{errors.domain.message as string}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="abstract" className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">
                    Abstract & Methodology <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-xs font-semibold dark:text-gray-400 text-slate-500">
                    {watch('abstract')?.length || 0} characters
                  </span>
                </div>
                <Textarea
                  id="abstract"
                  {...register('abstract')}
                  placeholder="Describe your project's problem statement, objectives, technical stack, methodology, and expected deliverables..."
                  className="h-36 rounded-xl dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 dark:text-white text-slate-900 placeholder:text-slate-400 resize-none"
                />
                {errors.abstract && <p className="text-rose-500 text-xs font-semibold">{errors.abstract.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords" className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">
                  Project Keywords
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywords.map(kw => (
                    <span key={kw} className="px-3 py-1 rounded-lg dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5">
                      #{kw}
                      <button type="button" onClick={() => removeKeyword(kw)} className="text-indigo-500 hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                </div>
                <Input
                  id="keywords"
                  value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  onKeyDown={addKeyword}
                  placeholder="Type keyword and press Enter (e.g. React, Python, MachineLearning)"
                  className="h-11 rounded-xl dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 dark:text-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">
                  GitHub / Repository Link (Optional)
                </Label>
                <Input
                  id="githubUrl"
                  {...register('githubUrl')}
                  placeholder="https://github.com/organization/repository"
                  className="h-11 rounded-xl dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 dark:text-white text-slate-900 placeholder:text-slate-400"
                />
                {errors.githubUrl && <p className="text-rose-500 text-xs font-semibold">{errors.githubUrl.message as string}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Team Validation */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-6">
              {teamLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <p className="dark:text-gray-400 text-slate-500 font-semibold">Validating team eligibility...</p>
                </div>
              ) : !team ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 dark:bg-rose-500/20 dark:text-rose-400 bg-rose-50 text-rose-600 border border-rose-200 rounded-3xl flex items-center justify-center mx-auto">
                    <X className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">No Approved Team Found</h3>
                  <p className="dark:text-gray-400 text-slate-500 max-w-md mx-auto text-sm font-medium">
                    You must be part of an approved team before creating a project proposal.
                  </p>
                  <Button
                    type="button"
                    onClick={() => navigate('/my-team')}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl px-6"
                  >
                    Go to My Team Page
                  </Button>
                </div>
              ) : team.status === 'PENDING' ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 dark:bg-amber-500/20 dark:text-amber-400 bg-amber-50 text-amber-600 border border-amber-200 rounded-3xl flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">Team Pending Approval</h3>
                  <p className="dark:text-gray-400 text-slate-600 font-medium">
                    Your team <strong className="dark:text-white text-slate-900">{team.name}</strong> is currently waiting for coordinator approval.
                  </p>
                  <div className="p-4 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl max-w-md mx-auto text-xs font-bold">
                    You cannot submit a project until your coordinator approves your team roster.
                  </div>
                </div>
              ) : team.status === 'REJECTED' ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 dark:bg-rose-500/20 dark:text-rose-400 bg-rose-50 text-rose-600 border border-rose-200 rounded-3xl flex items-center justify-center mx-auto">
                    <X className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">Team Roster Rejected</h3>
                  <p className="dark:text-gray-400 text-slate-600 font-medium">Your team proposal was rejected by the coordinator.</p>
                  {team.rejectionReason && (
                    <div className="p-4 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl max-w-md mx-auto text-xs font-bold">
                      Reason: {team.rejectionReason}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">Team Approved & Eligible!</h3>
                  <p className="dark:text-gray-400 text-slate-600 font-medium">
                    Your team <strong className="dark:text-white text-slate-900">{team.name}</strong> is fully approved.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 max-w-xs mx-auto text-sm">
                    <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-4 border dark:border-white/10 border-slate-200">
                      <p className="dark:text-gray-400 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Roster Members</p>
                      <p className="dark:text-white text-slate-900 font-extrabold text-lg">{team.members?.length ?? '—'}</p>
                    </div>
                    <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-4 border dark:border-white/10 border-slate-200">
                      <p className="dark:text-gray-400 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Team Status</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">Approved</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Guide Preferences */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b dark:border-white/10 border-slate-200/80 pb-4">
                <h3 className="text-xl font-extrabold dark:text-white text-slate-900">Step 3: Select Faculty Guide Preferences</h3>
                <p className="text-xs dark:text-gray-400 text-slate-500 font-medium">Rank your preferred faculty guides (1st choice, 2nd choice, 3rd choice).</p>
              </div>

              {[1, 2, 3].map((rank, idx) => (
                <div key={rank} className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">
                    Preference #{rank} {rank === 1 && <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">(Primary Choice)</span>}
                  </Label>
                  <select
                    value={guidePrefs[idx]}
                    onChange={(e) => {
                      const newPrefs = [...guidePrefs];
                      newPrefs[idx] = e.target.value;
                      setGuidePrefs(newPrefs);
                    }}
                    className="flex h-11 w-full rounded-xl border dark:border-white/10 border-slate-200 dark:bg-[#14161f] bg-slate-50 px-3 py-2 text-sm dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="" className="dark:bg-[#14161f] dark:text-gray-400 bg-white text-slate-400">Select Faculty Guide</option>
                    {(Array.isArray(guidesRes?.data) ? guidesRes.data : Array.isArray(guidesRes) ? guidesRes : []).map((g: any) => {
                      const profId = g.facultyProfileId || g.facultyProfile?.id || g.id;
                      const name = g.user?.name ?? g.name;
                      const des = g.facultyProfile?.designation || g.designation;
                      return (
                        <option key={profId} value={profId} className="dark:bg-[#14161f] dark:text-white bg-white text-slate-900">
                          {name} {des ? `- ${des}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t dark:border-white/10 border-slate-200/80">
            <Button
              type="button"
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="dark:text-gray-400 text-slate-600 font-bold rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step < 3 ? (
              <Button
                type="submit"
                disabled={step === 2 && !canProceedFromStep2}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/20 rounded-xl px-6"
              >
                {step === 2 && !canProceedFromStep2 && !teamLoading
                  ? 'Team must be approved'
                  : <>Next Step <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/20 rounded-xl px-6"
              >
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting Proposal...</> : <><Save className="w-4 h-4 mr-2" /> Create & Submit Project</>}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
