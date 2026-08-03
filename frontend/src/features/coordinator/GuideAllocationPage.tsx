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

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    REJECTED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Guide Allocation" subtitle="Manage faculty guide assignments for projects" />

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="preferences" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white text-gray-400">Guide Preferences</TabsTrigger>
          <TabsTrigger value="direct" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white text-gray-400">Direct Assignment</TabsTrigger>
        </TabsList>

        {/* Tab 1 — Guide Preferences */}
        <TabsContent value="preferences">
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {prefsLoading ? (
              <div className="p-8 text-center text-gray-400">Loading preferences…</div>
            ) : preferences.length === 0 ? (
              <EmptyState icon={User} title="No preferences submitted" description="Students haven't submitted guide preferences yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-4 py-3 text-gray-400">Project</th>
                      <th className="text-left px-4 py-3 text-gray-400">Faculty</th>
                      <th className="text-left px-4 py-3 text-gray-400">Rank</th>
                      <th className="text-left px-4 py-3 text-gray-400">Status</th>
                      <th className="text-left px-4 py-3 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preferences.map((p: any) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-white">{p.project?.title || p.projectId}</td>
                        <td className="px-4 py-3">
                          <div className="text-white">{p.facultyProfile?.user?.name}</div>
                          <div className="text-xs text-gray-500">{p.facultyProfile?.designation}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-400">#{p.rank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="success" onClick={() => approveMutation.mutate(p.id)} disabled={approveMutation.isPending} id={`approve-pref-${p.id}`}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => setRejectModal({ id: p.id })} id={`reject-pref-${p.id}`}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                          {p.status !== 'PENDING' && <span className="text-gray-500 text-xs italic">—</span>}
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
        <TabsContent value="direct" className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 max-w-lg">
            <h3 className="text-white font-semibold">Assign Guide Directly</h3>
            <div className="space-y-1.5">
              <Label>Select Project</Label>
              <Select value={assignProjectId} onValueChange={setAssignProjectId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white" id="assign-project-select">
                  <SelectValue placeholder="Choose a project…" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-gray-300">{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Select Faculty</Label>
              <Select value={assignFacultyId} onValueChange={setAssignFacultyId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white" id="assign-faculty-select">
                  <SelectValue placeholder="Choose a faculty member…" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {guides.map((g: any) => {
                    const profId = g.facultyProfileId || g.facultyProfile?.id || g.id;
                    return (
                      <SelectItem key={profId} value={profId} className="text-gray-300">
                        {g.name} — {g.facultyProfile?.designation || 'Faculty'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => assignMutation.mutate()} disabled={!assignProjectId || !assignFacultyId || assignMutation.isPending} id="direct-assign-btn">
              {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Assign Guide
            </Button>
          </div>

          {/* Existing Assignments */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold">Current Assignments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-4 py-3 text-gray-400">Project</th>
                    <th className="text-left px-4 py-3 text-gray-400">Guide</th>
                    <th className="text-left px-4 py-3 text-gray-400">Assigned</th>
                    <th className="text-left px-4 py-3 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.filter((p: any) => p.guideAssignment?.isActive).map((p: any) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{p.title}</td>
                      <td className="px-4 py-3">
                        <div className="text-white">{p.guideAssignment?.facultyProfile?.user?.name}</div>
                        <div className="text-xs text-gray-500">{p.guideAssignment?.facultyProfile?.designation}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {p.guideAssignment?.assignedAt ? format(new Date(p.guideAssignment.assignedAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="danger" onClick={() => removeMutation.mutate(p.guideAssignment.id)} disabled={removeMutation.isPending} id={`remove-guide-${p.id}`}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {projects.filter((p: any) => p.guideAssignment?.isActive).length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No active guide assignments</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={o => !o && setRejectModal(null)}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
          <DialogHeader><DialogTitle>Reject Guide Preference</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason (optional)</Label>
            <Textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Explain the reason for rejection…" rows={3} id="reject-note-input" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => rejectModal && rejectMutation.mutate({ id: rejectModal.id, note: rejectNote })} disabled={rejectMutation.isPending} id="confirm-reject-btn">
              {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
