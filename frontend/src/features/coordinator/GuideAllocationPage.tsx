import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle, XCircle, UserPlus, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { approvePreference, rejectPreference, assignGuide, removeGuideAssignment, getAvailableGuides } from '@/api/guides.api';
import { getProjects } from '@/api/projects.api';
import { api } from '@/api/client';

export default function GuideAllocationPage() {
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignFacultyId, setAssignFacultyId] = useState('');

  const { data: projectsData } = useQuery({ queryKey: ['projects'], queryFn: () => getProjects({ limit: 100 }) });
  const { data: guidesData } = useQuery({ queryKey: ['available-guides'], queryFn: getAvailableGuides });

  // Fetch all guide preferences across projects
  const { data: prefsData, isLoading: prefsLoading } = useQuery({
    queryKey: ['all-guide-preferences'],
    queryFn: () => api.get('/guides/preferences/all').then(r => r.data).catch(() => ({ data: [] })),
  });

  const rawProjects = projectsData as any;
  const projects: any[] = Array.isArray(rawProjects)
    ? rawProjects
    : Array.isArray(rawProjects?.data?.items)
    ? rawProjects.data.items
    : Array.isArray(rawProjects?.data)
    ? rawProjects.data
    : [];

  const rawGuides = guidesData as any;
  const guides: any[] = Array.isArray(rawGuides)
    ? rawGuides
    : Array.isArray(rawGuides?.data)
    ? rawGuides.data
    : [];

  const rawPrefs = prefsData as any;
  const preferences: any[] = Array.isArray(rawPrefs)
    ? rawPrefs
    : Array.isArray(rawPrefs?.data)
    ? rawPrefs.data
    : [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvePreference(id),
    onSuccess: () => { toast.success('Guide approved & assigned'); qc.invalidateQueries({ queryKey: ['all-guide-preferences'] }); },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => rejectPreference(id, note),
    onSuccess: () => { toast.success('Preference rejected'); qc.invalidateQueries({ queryKey: ['all-guide-preferences'] }); setRejectModal(null); setRejectNote(''); },
    onError: () => toast.error('Failed to reject'),
  });

  const assignMutation = useMutation({
    mutationFn: () => assignGuide({ projectId: assignProjectId, facultyProfileId: assignFacultyId }),
    onSuccess: () => { toast.success('Guide assigned directly'); qc.invalidateQueries({ queryKey: ['projects'] }); setAssignProjectId(''); setAssignFacultyId(''); },
    onError: () => toast.error('Failed to assign guide'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeGuideAssignment(id),
    onSuccess: () => { toast.success('Assignment removed'); qc.invalidateQueries({ queryKey: ['projects'] }); },
    onError: () => toast.error('Failed to remove'),
  });

  const STATUS_CLASSES: Record<string, string> = {
    PENDING: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    APPROVED: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    REJECTED: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Guide Allocation" subtitle="Manage faculty guide assignments and rank preferences for projects." />

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList className="bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="preferences" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground font-semibold text-xs rounded-lg px-4 py-2">
            Student Guide Preferences
          </TabsTrigger>
          <TabsTrigger value="direct" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground font-semibold text-xs rounded-lg px-4 py-2">
            Direct Assignment
          </TabsTrigger>
        </TabsList>

        {/* Tab 1 — Guide Preferences */}
        <TabsContent value="preferences">
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            {prefsLoading ? (
              <div className="p-8 text-center text-muted-foreground font-normal">Loading preferences…</div>
            ) : preferences.length === 0 ? (
              <EmptyState icon={User} title="No preferences submitted" description="Students haven't submitted guide preferences yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <tr>
                      <th className="text-left px-5 py-3">Project</th>
                      <th className="text-left px-5 py-3">Faculty</th>
                      <th className="text-left px-5 py-3">Rank Preference</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-left px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preferences.map((p: any) => (
                      <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-5 py-3.5 text-foreground font-semibold">{p.project?.title || p.projectId}</td>
                        <td className="px-5 py-3.5">
                          <div className="text-foreground font-semibold">{p.facultyProfile?.user?.name || 'Faculty Member'}</div>
                          <div className="text-xs text-muted-foreground font-normal">{p.facultyProfile?.designation || 'Guide'}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                            Rank #{p.rank}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${STATUS_CLASSES[p.status] || ''}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {p.status === 'PENDING' && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="success" onClick={() => approveMutation.mutate(p.id)} disabled={approveMutation.isPending} id={`approve-pref-${p.id}`} className="text-xs font-semibold">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => setRejectModal({ id: p.id })} id={`reject-pref-${p.id}`} className="text-xs font-semibold">
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                          {p.status !== 'PENDING' && <span className="text-muted-foreground text-xs italic">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2 — Direct Assignment */}
        <TabsContent value="direct" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4 max-w-lg">
            <h3 className="text-foreground font-semibold text-base">Direct Guide Assignment</h3>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Select Project</Label>
              <Select value={assignProjectId} onValueChange={setAssignProjectId}>
                <SelectTrigger className="input-field" id="assign-project-select">
                  <SelectValue placeholder="Choose a project…" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm font-medium">{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Select Faculty Mentor</Label>
              <Select value={assignFacultyId} onValueChange={setAssignFacultyId}>
                <SelectTrigger className="input-field" id="assign-faculty-select">
                  <SelectValue placeholder="Choose a faculty member…" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {guides.map((g: any) => {
                    const profId = g.facultyProfileId || g.facultyProfile?.id || g.id;
                    return (
                      <SelectItem key={profId} value={profId} className="text-sm font-medium">
                        {g.name} — {g.facultyProfile?.designation || 'Faculty'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => assignMutation.mutate()} disabled={!assignProjectId || !assignFacultyId || assignMutation.isPending} id="direct-assign-btn" className="btn-primary">
              {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Assign Guide
            </Button>
          </div>

          {/* Existing Assignments */}
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-foreground font-semibold text-base">Current Active Guide Assignments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="text-left px-5 py-3">Project Title</th>
                    <th className="text-left px-5 py-3">Assigned Mentor</th>
                    <th className="text-left px-5 py-3">Assigned Date</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.filter((p: any) => p.guideAssignment?.isActive).map((p: any) => (
                    <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-3.5 text-foreground font-semibold">{p.title}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-foreground font-semibold">{p.guideAssignment?.facultyProfile?.user?.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">{p.guideAssignment?.facultyProfile?.designation}</div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs font-medium">
                        {p.guideAssignment?.assignedAt ? format(new Date(p.guideAssignment.assignedAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Button size="sm" variant="destructive" onClick={() => removeMutation.mutate(p.guideAssignment.id)} disabled={removeMutation.isPending} id={`remove-guide-${p.id}`}>
                          Remove Assignment
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {projects.filter((p: any) => p.guideAssignment?.isActive).length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground font-normal">No active guide assignments.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={o => !o && setRejectModal(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle className="text-base font-semibold">Reject Guide Preference</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Reason (optional)</Label>
            <Textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Explain the reason for rejection…" rows={3} id="reject-note-input" className="input-field" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => rejectModal && rejectMutation.mutate({ id: rejectModal.id, note: rejectNote })} disabled={rejectMutation.isPending} id="confirm-reject-btn">
              {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
