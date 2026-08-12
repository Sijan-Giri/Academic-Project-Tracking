import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';

import { useSemesters } from '@/hooks';
import { PageHeader, DataTable, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, Input } from '@/components';

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
    isSubmitting,
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
    { accessorKey: 'name', header: 'Name', cell: ({ row }: any) => <span className="font-semibold text-foreground">{row.original.name}</span> },
    { accessorKey: 'number', header: 'Sem Number' },
    { 
      accessorKey: 'isCurrent', 
      header: 'Current',
      cell: ({ row }: any) => (
        row.original.isCurrent ? <Badge className="bg-success-subtle text-success border border-success">Current</Badge> : null
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
          className="border-border hover:bg-neutral-subtle"
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
          <Button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Add Semester
          </Button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
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
                <Button type="submit" isLoading={isSubmitting} loadingText="Creating Semester..." className="btn-primary">Create Semester</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
