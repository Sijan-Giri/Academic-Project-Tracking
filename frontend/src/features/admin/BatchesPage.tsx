import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const batchSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  departmentId: z.string().min(1, 'Department is required'),
  academicYearId: z.string().min(1, 'Academic Year is required'),
});

type BatchFormValues = z.infer<typeof batchSchema>;

export default function BatchesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => (await api.get('/batches')).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: BatchFormValues) => api.post('/batches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch created successfully');
      setCreateOpen(false);
    },
    onError: () => toast.error('Failed to create batch'),
  });

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: { name: '', departmentId: '', academicYearId: '' },
  });

  const columns = [
    { accessorKey: 'name', header: 'Batch Name', cell: ({ row }: any) => <span className="font-semibold text-white">{row.original.name}</span> },
    { accessorKey: 'department.code', header: 'Department', cell: ({ row }: any) => row.original.department?.code || 'N/A' },
    { accessorKey: 'academicYear.label', header: 'Academic Year', cell: ({ row }: any) => row.original.academicYear?.label || 'N/A' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-indigo-500' : ''}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(row.original)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batches"
        subtitle="Manage student batches"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Batch
          </Button>
        }
      />
      <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-4">
        <DataTable columns={columns} data={batches || []} isisLoading={isLoading} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0f1117] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Add Batch</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name</FormLabel>
                  <FormControl><Input placeholder="e.g. 2023-2027 CS" className="bg-[#1a1d27] border-white/10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {/* Dropdowns for departmentId and academicYearId can be added here, similar to UsersPage */}
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
