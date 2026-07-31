import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Megaphone, Trash2, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '@/api/announcements.api';
import { getDepartments } from '@/api/departments.api';
import { getBatches } from '@/api/batches.api';
import { getSemesters } from '@/api/semesters.api';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const announcementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  departmentIds: z.array(z.string()).default([]),
  batchIds: z.array(z.string()).default([]),
  semesterIds: z.array(z.string()).default([]),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function CoordinatorAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data: announcementsRes, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => getAnnouncements(),
  });

  const { data: deptRes } = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments() });
  const { data: batchRes } = useQuery({ queryKey: ['batches'], queryFn: () => getBatches() });
  const { data: semRes } = useQuery({ queryKey: ['semesters'], queryFn: () => getSemesters() });

  // Safe response unwrapping
  const announcementList: any[] = Array.isArray((announcementsRes as any)?.data?.items)
    ? (announcementsRes as any).data.items
    : (Array.isArray((announcementsRes as any)?.data) ? (announcementsRes as any).data : (Array.isArray(announcementsRes) ? announcementsRes : []));

  const departmentsList: any[] = Array.isArray((deptRes as any)?.data) ? (deptRes as any).data : (Array.isArray(deptRes) ? deptRes : []);
  const batchesList: any[] = Array.isArray((batchRes as any)?.data) ? (batchRes as any).data : (Array.isArray(batchRes) ? batchRes : []);
  const semestersList: any[] = Array.isArray((semRes as any)?.data) ? (semRes as any).data : (Array.isArray(semRes) ? semRes : []);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', content: '', departmentIds: [], batchIds: [], semesterIds: [] },
  });

  const selectedDepts = watch('departmentIds') || [];
  const selectedBatches = watch('batchIds') || [];
  const selectedSems = watch('semesterIds') || [];

  const createMutation = useMutation({
    mutationFn: (data: AnnouncementFormValues) => createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement broadcasted successfully!');
      setCreateOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to post announcement');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
      setDeleteItem(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete announcement');
    },
  });

  const toggleSelection = (field: 'departmentIds' | 'batchIds' | 'semesterIds', id: string) => {
    const current = watch(field) || [];
    if (current.includes(id)) {
      setValue(field, current.filter((item: string) => item !== id));
    } else {
      setValue(field, [...current, id]);
    }
  };

  return (
    <div className="space-y-6 min-h-screen text-white p-6 bg-[#0f1117]">
      <PageHeader
        title="Announcements Broadcast"
        subtitle="Publish updates to specific departments, batches, or semesters"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Announcement
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcementList.map((ann: any) => {
            const dateVal = ann.createdAt || ann.date || Date.now();
            const dateStr = format(new Date(dateVal), 'MMM d, yyyy');
            const targets = ann.targets || [];

            return (
              <Card key={ann.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-indigo-500/50 transition-colors flex flex-col relative group">
                <CardHeader className="pb-3 border-b border-white/10 flex flex-row items-start justify-between space-y-0">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-white leading-tight">{ann.title}</CardTitle>
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" /> {dateStr}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteItem(ann)}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                </CardContent>
                <CardFooter className="pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                  {targets.length > 0 ? (
                    targets.map((t: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-[11px] border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                        {t.department?.name || t.batch?.name || t.semester?.name || 'Targeted'}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      Global Broadcast
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            );
          })}
          {announcementList.length === 0 && (
            <div className="text-slate-400 col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <Megaphone className="w-10 h-10 mx-auto text-slate-500 mb-3" />
              <p className="text-lg font-medium text-slate-300">No announcements posted yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click "New Announcement" to publish your first update.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#12141d] border-white/10 text-white sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">New Announcement</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-gray-300">Announcement Title</Label>
              <Input
                {...register('title')}
                placeholder="e.g. Abstract Submission Deadline Extended"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-300">Content</Label>
              <Textarea
                {...register('content')}
                rows={4}
                placeholder="Write announcement details here..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              {errors.content && <p className="text-red-400 text-xs">{errors.content.message}</p>}
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Targeting Options (Leave unselected for Global)
              </h4>

              <div className="grid grid-cols-3 gap-3">
                {/* Departments */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-400">Departments</Label>
                  <div className="max-h-32 overflow-y-auto bg-white/5 p-2 rounded-lg border border-white/10 space-y-1.5">
                    {departmentsList.map((d: any) => (
                      <label key={d.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDepts.includes(d.id)}
                          onChange={() => toggleSelection('departmentIds', d.id)}
                          className="rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-0"
                        />
                        <span className="truncate">{d.code || d.name}</span>
                      </label>
                    ))}
                    {departmentsList.length === 0 && <p className="text-[10px] text-gray-500">No departments</p>}
                  </div>
                </div>

                {/* Batches */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-400">Batches</Label>
                  <div className="max-h-32 overflow-y-auto bg-white/5 p-2 rounded-lg border border-white/10 space-y-1.5">
                    {batchesList.map((b: any) => (
                      <label key={b.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBatches.includes(b.id)}
                          onChange={() => toggleSelection('batchIds', b.id)}
                          className="rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-0"
                        />
                        <span className="truncate">{b.name}</span>
                      </label>
                    ))}
                    {batchesList.length === 0 && <p className="text-[10px] text-gray-500">No batches</p>}
                  </div>
                </div>

                {/* Semesters */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-400">Semesters</Label>
                  <div className="max-h-32 overflow-y-auto bg-white/5 p-2 rounded-lg border border-white/10 space-y-1.5">
                    {semestersList.map((s: any) => (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSems.includes(s.id)}
                          onChange={() => toggleSelection('semesterIds', s.id)}
                          className="rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-0"
                        />
                        <span className="truncate">{s.name || `Sem ${s.number}`}</span>
                      </label>
                    ))}
                    {semestersList.length === 0 && <p className="text-[10px] text-gray-500">No semesters</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-white/10 text-gray-300">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Broadcasting...</> : 'Broadcast Announcement'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(o) => !o && setDeleteItem(null)}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
