import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Megaphone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/client';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const announcementSchema = z.object({
  title: z.string().min(5, 'Title required'),
  content: z.string().min(10, 'Content required'),
  targetDepartmentIds: z.array(z.string()),
  targetBatchIds: z.array(z.string()),
  targetSemesterIds: z.array(z.string()),
});

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data: announcements, isLoading } = useQuery({ queryKey: ['announcements'], queryFn: async () => (await api.get('/announcements')).data });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: async () => (await api.get('/departments')).data });
  const { data: batches } = useQuery({ queryKey: ['batches'], queryFn: async () => (await api.get('/batches')).data });
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: async () => (await api.get('/semesters')).data });

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', content: '', targetDepartmentIds: [], targetBatchIds: [], targetSemesterIds: [] },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/announcements', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Announcement posted'); setCreateOpen(false); form.reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Announcement deleted'); setDeleteItem(null); },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements" subtitle="Broadcast messages to specific departments, batches, or semesters"
        actions={<Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>}
      />

      {isLoading ? <div className="text-white">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements?.map((ann: any) => (
            <Card key={ann.id} className="bg-[#1a1d27] border-white/10 text-white flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <CardHeader className="pb-3 border-b border-white/10 flex flex-row items-start justify-between space-y-0">
                <div className="flex gap-3">
                  <Megaphone className="w-5 h-5 text-indigo-400 mt-1" />
                  <div>
                    <CardTitle className="text-lg leading-tight">{ann.title}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{new Date(ann.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDeleteItem(ann)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
              <CardFooter className="pt-3 border-t border-white/10 flex flex-wrap gap-1">
                {ann.targets?.map((t: any, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs border-indigo-500/20 text-indigo-300 bg-indigo-500/10">
                    {t.type}: {t.name}
                  </Badge>
                ))}
                {(!ann.targets || ann.targets.length === 0) && <Badge variant="outline" className="text-xs border-emerald-500/20 text-emerald-400 bg-emerald-500/10">Global Broadcast</Badge>}
              </CardFooter>
            </Card>
          ))}
          {(!announcements || announcements.length === 0) && <div className="text-gray-500 col-span-full py-12 text-center bg-[#1a1d27] rounded-xl border border-dashed border-white/10">No announcements posted yet.</div>}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0f1117] border-white/10 text-white sm:max-w-[600px]">
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => createMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input className="bg-[#1a1d27] border-white/10" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea className="bg-[#1a1d27] border-white/10 min-h-[100px]" {...field} /></FormControl></FormItem>
              )} />
              
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-gray-300">Targeting (Leave empty for Global)</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="targetDepartmentIds" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs text-gray-400">Departments</FormLabel>
                      <div className="max-h-32 overflow-y-auto bg-[#1a1d27] p-2 rounded border border-white/10 space-y-1">
                        {departments?.map((d: any) => (
                          <label key={d.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={field.value.includes(d.id)} onChange={e => { field.onChange(e.target.checked ? [...field.value, d.id] : field.value.filter(id => id !== d.id)); }} />{d.code}</label>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="targetBatchIds" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs text-gray-400">Batches</FormLabel>
                      <div className="max-h-32 overflow-y-auto bg-[#1a1d27] p-2 rounded border border-white/10 space-y-1">
                        {batches?.map((b: any) => (
                          <label key={b.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={field.value.includes(b.id)} onChange={e => { field.onChange(e.target.checked ? [...field.value, b.id] : field.value.filter(id => id !== b.id)); }} />{b.name}</label>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="targetSemesterIds" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs text-gray-400">Semesters</FormLabel>
                      <div className="max-h-32 overflow-y-auto bg-[#1a1d27] p-2 rounded border border-white/10 space-y-1">
                        {semesters?.map((s: any) => (
                          <label key={s.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={field.value.includes(s.id)} onChange={e => { field.onChange(e.target.checked ? [...field.value, s.id] : field.value.filter(id => id !== s.id)); }} />{s.name}</label>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-white/10">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Broadcast</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteItem} onOpenChange={o => !o && setDeleteItem(null)} title="Delete Announcement" description="Delete this announcement?" onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)} confirmText="Delete" variant="danger" />
    </div>
  );
}
