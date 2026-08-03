import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ChevronRight, ChevronLeft, Loader2, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
      navigate('/student/my-project');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create project');
    }
  });

  // Extract the actual team object — the API may wrap it in { data: ... }
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
    });
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />
          <div className="absolute left-0 top-1/2 h-1 bg-indigo-500 -translate-y-1/2 rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", 
                step >= s ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-gray-800 text-gray-400 border border-white/10"
              )}>
                {s}
              </div>
              <span className={cn("absolute -bottom-6 text-xs whitespace-nowrap font-medium", step >= s ? "text-indigo-300" : "text-gray-500")}>
                {s === 1 ? 'Project Info' : s === 2 ? 'Team' : 'Guide Prefs'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mt-12">
        <form onSubmit={step === 3 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); handleSubmit(() => setStep(step + 1))(e); }}>
          
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Project Title <span className="text-red-400">*</span></Label>
                <Input id="title" {...register('title')} placeholder="Enter a descriptive title" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="text-gray-300">Domain <span className="text-red-400">*</span></Label>
                <select id="domain" {...register('domain')} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="" className="bg-gray-900 text-gray-400">Select Domain</option>
                  {domains.map(d => <option key={d} value={d} className="bg-gray-900 text-white">{d}</option>)}
                </select>
                {errors.domain && <p className="text-red-400 text-xs">{errors.domain.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract" className="text-gray-300 flex justify-between">
                  <span>Abstract <span className="text-red-400">*</span></span>
                  <span className="text-xs text-gray-500">{watch('abstract')?.length || 0} chars</span>
                </Label>
                <Textarea id="abstract" {...register('abstract')} placeholder="Describe your project's objectives, methodology, and expected outcomes..." className="h-32 bg-white/5 border-white/10 text-white resize-none" />
                {errors.abstract && <p className="text-red-400 text-xs">{errors.abstract.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-gray-300">Keywords</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywords.map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-sm border border-indigo-500/30 flex items-center gap-1">
                      {kw}
                      <button type="button" onClick={() => removeKeyword(kw)} className="text-indigo-400 hover:text-indigo-200"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <Input id="keywords" value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={addKeyword} placeholder="Type keyword and press Enter" className="bg-white/5 border-white/10 text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="text-gray-300">GitHub URL (Optional)</Label>
                <Input id="githubUrl" {...register('githubUrl')} placeholder="https://github.com/username/repo" className="bg-white/5 border-white/10 text-white" />
                {errors.githubUrl && <p className="text-red-400 text-xs">{errors.githubUrl.message as string}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-6">
              {teamLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  <p className="text-gray-400">Loading team info...</p>
                </div>
              ) : !team ? (
                <div>
                  <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Team Found</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">You need to be part of an <strong>approved</strong> team to create a project.</p>
                  <Button type="button" variant="outline" onClick={() => navigate('/student/team')} className="bg-white/5 text-white border-white/10 hover:bg-white/10">
                    Create a Team
                  </Button>
                </div>
              ) : team.status === 'PENDING' ? (
                <div>
                  <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Team Pending Approval</h3>
                  <p className="text-gray-400 mb-4">Your team <strong className="text-white">{team.name}</strong> is waiting for coordinator approval.</p>
                  <p className="text-sm text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 max-w-md mx-auto">
                    You cannot create a project until your team is approved. Please contact your coordinator.
                  </p>
                </div>
              ) : team.status === 'REJECTED' ? (
                <div>
                  <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Team Rejected</h3>
                  <p className="text-gray-400 mb-2">Your team was rejected.</p>
                  {team.rejectionReason && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 max-w-md mx-auto">
                      Reason: {team.rejectionReason}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Team Ready!</h3>
                  <p className="text-gray-400">Your team <strong className="text-white">{team.name}</strong> is approved. You can proceed to create your project.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 max-w-xs mx-auto text-sm">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-gray-500 text-xs mb-1">Members</p>
                      <p className="text-white font-semibold">{team.members?.length ?? '—'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-gray-500 text-xs mb-1">Status</p>
                      <p className="text-emerald-400 font-semibold">Approved</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white">Select Guide Preferences (Optional)</h3>
                <p className="text-sm text-gray-400">Rank your preferred faculty guides. The coordinator will try to assign one of them.</p>
              </div>

              {[1, 2, 3].map((rank, idx) => (
                <div key={rank} className="space-y-2">
                  <Label className="text-gray-300">Preference {rank}</Label>
                  <select 
                    value={guidePrefs[idx]}
                    onChange={(e) => {
                      const newPrefs = [...guidePrefs];
                      newPrefs[idx] = e.target.value;
                      setGuidePrefs(newPrefs);
                    }}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" className="bg-gray-900 text-gray-400">Select Faculty</option>
                    {(Array.isArray(guidesRes?.data) ? guidesRes.data : Array.isArray(guidesRes) ? guidesRes : []).map((g: any) => {
                      const profId = g.facultyProfileId || g.facultyProfile?.id || g.id;
                      return (
                        <option key={profId} value={profId} className="bg-gray-900 text-white">
                          {g.user?.name ?? g.name} {g.facultyProfile?.designation ? `- ${g.facultyProfile.designation}` : g.designation ? `- ${g.designation}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="text-gray-400 hover:text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-2" /> {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            {step < 3 ? (
              <Button
                type="submit"
                disabled={step === 2 && !canProceedFromStep2}
                className="bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40"
              >
                {step === 2 && !canProceedFromStep2 && !teamLoading
                  ? 'Team must be approved'
                  : <>Next <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
            ) : (
              <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white">
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><Save className="w-4 h-4 mr-2" /> Create Project</>}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
