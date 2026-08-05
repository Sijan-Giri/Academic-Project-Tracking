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
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
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

  // Safe response unwrapping
  const announcementList: any[] = Array.isArray((announcementsRes as any)?.data?.items)
    ? (announcementsRes as any).data.items
    : (Array.isArray((announcementsRes as any)?.data) ? (announcementsRes as any).data : (Array.isArray(announcementsRes) ? announcementsRes : []));

  const departmentsList: any[] = Array.isArray((deptRes as any)?.data) ? (deptRes as any).data : (Array.isArray(deptRes) ? deptRes : []);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', content: '', departmentIds: [], batchIds: [], semesterIds: [] },
  });

  const createMutation = useMutation({
    mutationFn: (data: AnnouncementFormValues) => createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement broadcasted successfully!');
      setCreateOpen(false);
      reset();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to broadcast announcement'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
      setDeleteItem(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete announcement'),
  });

  const selectedDepts = watch('departmentIds') || [];

  const toggleTarget = (field: 'departmentIds' | 'batchIds' | 'semesterIds', id: string) => {
    const current = watch(field) || [];
    if (current.includes(id)) {
      setValue(field, current.filter((x: string) => x !== id));
    } else {
      setValue(field, [...current, id]);
    }
  };

  const onSubmit = (data: AnnouncementFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Broadcast Announcements"
        subtitle="Post department-wide notices, review stage guidelines, and presentation schedules."
        actions={
          <Button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Post Announcement
          </Button>
        }
      />

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-secondary/50" />
              <CardContent className="h-24 bg-secondary/30 mt-2" />
            </Card>
          ))
        ) : announcementList.length > 0 ? (
          announcementList.map((item: any) => {
            const dateVal = item.createdAt || item.date || Date.now();
            const dateStr = format(new Date(dateVal), 'MMM d, yyyy');
            return (
              <Card key={item.id} className="flex flex-col justify-between">
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground pt-2 line-clamp-1">{item.title}</CardTitle>
                </CardHeader>

                <CardContent className="py-4">
                  <p className="text-foreground text-xs font-normal leading-relaxed whitespace-pre-line line-clamp-4">{item.content}</p>
                </CardContent>

                <CardFooter className="border-t border-border pt-3 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-normal">Posted by Coordinator</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteItem(item)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-7 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full border border-border bg-card shadow-xs rounded-xl p-12 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground opacity-50 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No Announcements Posted</h3>
            <p className="text-xs text-muted-foreground mt-1 font-normal max-w-sm mx-auto">
              Broadcast announcements to notify students and faculty about deadlines.
            </p>
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Post New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Title</Label>
              <Input id="title" placeholder="e.g. Milestone 1 Defense Schedule Published" {...register('title')} />
              {errors.title && <p className="text-xs text-rose-600 font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Content / Details</Label>
              <Textarea
                id="content"
                rows={4}
                placeholder="Write announcement content, instructions, and deadlines..."
                {...register('content')}
                className="input-field"
              />
              {errors.content && <p className="text-xs text-rose-600 font-medium">{errors.content.message}</p>}
            </div>

            {/* Target Filters */}
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Target Department (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {departmentsList.map((d: any) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleTarget('departmentIds', d.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                      selectedDepts.includes(d.id)
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="btn-primary">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Broadcast Notice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${deleteItem?.title}"?`}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        variant="danger"
      />
    </div>
  );
}
