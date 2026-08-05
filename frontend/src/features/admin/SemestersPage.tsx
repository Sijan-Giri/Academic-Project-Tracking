import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';

import { useSemesters } from '@/hooks/useSemesters';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
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
  const [createOpen, setCreateOpen] = useState(false);

  const {
    semesters,
    isLoading,
    createSemester,
    setCurrentSemester,
  } = useSemesters();

  const handleCreate = async (data: SemesterFormValues) => {
    try {
      await createSemester(data);
      setCreateOpen(false);
      form.reset();
    } catch (_) {}
  };

  const handleSetCurrent = async (id: string) => {
    try {
      await setCurrentSemester(id);
    } catch (_) {}
  };

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: { batchId: '', number: 1, name: '', startDate: '', endDate: '' },
  });

  const columns = [
    { accessorKey: 'batch.name', header: 'Batch', cell: ({ row }: any) => row.original.batch?.name || 'N/A' },
    { accessorKey: 'name', header: 'Name', cell: ({ row }: any) => <span className="font-semibold dark:text-white text-slate-900">{row.original.name}</span> },
    { accessorKey: 'number', header: 'Sem Number' },
    { 
      accessorKey: 'isCurrent', 
      header: 'Current',
      cell: ({ row }: any) => (
        row.original.isCurrent ? <Badge className="dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-700 border border-emerald-300">Current</Badge> : null
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
          onClick={() => handleSetCurrent(row.original.id)}
          className="dark:border-white/10 dark:hover:bg-white/5 border-slate-300 hover:bg-slate-100"
        >
          Set as Current
        </Button>
      ),
    },
  ];

  const semesterList = semesters;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semesters"
        subtitle="Manage academic semesters"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Semester
          </Button>
        }
      />
      <div className="dark:bg-[#1a1d27] bg-white rounded-xl border dark:border-white/10 border-slate-200 p-4 shadow-sm">
        <DataTable columns={columns} data={semesterList} isLoading={isLoading} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Add Semester</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="number" render={({ field }) => (
                <FormItem><FormLabel>Semester Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Create</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
