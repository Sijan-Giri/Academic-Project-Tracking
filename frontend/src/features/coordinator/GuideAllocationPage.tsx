import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, PageHeader } from '@/components';
import { useGuideAllocation } from '@/hooks';

export default function GuideAllocationPage() {
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignFacultyId, setAssignFacultyId] = useState('');

  const {
    projects,
    guides,
    assignments,
    assignGuide,
    removeGuide,
    isSubmitting,
  } = useGuideAllocation();

  const activeAssignmentsList = assignments.length > 0
    ? assignments.map((a: any) => ({
        id: a.id,
        projectId: a.projectId,
        projectTitle: a.project?.title || 'Project',
        facultyName: a.facultyProfile?.user?.name || 'Assigned Faculty',
        facultyDesignation: a.facultyProfile?.designation || 'Faculty Guide',
        assignedAt: a.assignedAt,
        isActive: a.isActive,
      }))
    : projects
        .filter((p: any) => p.guideAssignment)
        .map((p: any) => ({
          id: p.guideAssignment.id,
          projectId: p.id,
          projectTitle: p.title,
          facultyName: p.guideAssignment.facultyProfile?.user?.name || 'Assigned Faculty',
          facultyDesignation: p.guideAssignment.facultyProfile?.designation || 'Faculty Guide',
          assignedAt: p.guideAssignment.assignedAt,
          isActive: p.guideAssignment.isActive,
        }));

  const handleDirectAssign = async () => {
    if (!assignProjectId || !assignFacultyId) return;
    try {
      await assignGuide({ projectId: assignProjectId, facultyProfileId: assignFacultyId });
      setAssignProjectId('');
      setAssignFacultyId('');
    } catch (_) {}
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await removeGuide(assignmentId);
    } catch (_) {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Guide Allocation" subtitle="Assign faculty mentors to academic projects and manage current allocations." />

      <div className="space-y-6">
        {}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4 max-w-lg">
          <h3 className="text-foreground font-semibold text-base">Assign Faculty Mentor</h3>
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
          <Button
            onClick={handleDirectAssign}
            disabled={!assignProjectId || !assignFacultyId}
            isLoading={isSubmitting}
            loadingText="Assigning Guide..."
            id="direct-assign-btn"
            className="btn-primary"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Assign Guide
          </Button>
        </div>

        {}
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
                {activeAssignmentsList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-5 py-3.5 text-foreground font-semibold">{item.projectTitle}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-foreground font-semibold">{item.facultyName}</div>
                      <div className="text-xs text-muted-foreground font-normal">{item.facultyDesignation}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs font-medium">
                      {item.assignedAt ? format(new Date(item.assignedAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveAssignment(item.id)} disabled={isSubmitting} id={`remove-guide-${item.id}`}>
                        Remove Assignment
                      </Button>
                    </td>
                  </tr>
                ))}
                {activeAssignmentsList.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground font-normal">No active guide assignments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
