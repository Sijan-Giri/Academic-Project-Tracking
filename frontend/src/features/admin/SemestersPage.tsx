import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const semesterSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  number: z.coerce.number().min(1).max(8),
  name: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
});

type SemesterFormValues = z.infer<typeof semesterSchema>;

export default function SemestersPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: semesters, isLoading } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => (await api.get('/semesters')).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: SemesterFormValues) => api.post('/semesters', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast.success('Semester created successfully');
      setCreateOpen(false);
    },
    onError: () => toast.error('Failed to create semester'),
  });

  const setCurrentMutation = useMutation({
    mutationFn: (id: string) => api.put(`/semesters/${id}/set-current`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast.success('Current semester updated');
    },
  });

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: { batchId: '', number: 1, name: '', startDate: '', endDate: '' },
  });

  const columns = [
    { accessorKey: 'batch.name', header: 'Batch', cell: ({ row }: any) => row.original.batch?.name || 'N/A' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'number', header: 'Sem Number' },
    { 
      accessorKey: 'isCurrent', 
      header: 'Current',
      cell: ({ row }: any) => (
        row.original.isCurrent ? <Badge className="bg-emerald-500/20 text-emerald-400">Current</Badge> : null
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={row.original.isCurrent}
          onClick={() => setCurrentMutation.mutate(row.original.id)}
          className="border-white/10 hover:bg-white/5"
        >
          Set as Current
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semesters"
        subtitle="Manage academic semesters"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Semester
          </Button>
        }
      />
      <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-4">
        <DataTable columns={columns} data={semesters || []} isisLoading={isLoading} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0f1117] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Add Semester</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input className="bg-[#1a1d27] border-white/10" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="number" render={({ field }) => (
                <FormItem><FormLabel>Semester Number</FormLabel><FormControl><Input type="number" className="bg-[#1a1d27] border-white/10" {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" className="bg-[#1a1d27] border-white/10" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" className="bg-[#1a1d27] border-white/10" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-white/10">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
