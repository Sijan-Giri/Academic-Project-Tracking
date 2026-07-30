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
import { Switch } from '@/components/ui/switch';

const academicYearSchema = z.object({
  startYear: z.coerce.number().min(2000, 'Invalid year').max(2100, 'Invalid year'),
  endYear: z.coerce.number().min(2000).max(2100),
  isActive: z.boolean().default(true),
}).refine(data => data.endYear > data.startYear, {
  message: "End year must be greater than start year",
  path: ["endYear"],
});

type AcademicYearFormValues = z.infer<typeof academicYearSchema>;

export default function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data: academicYears, isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get('/academic-years')).data,
  });

  const form = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: { startYear: new Date().getFullYear(), endYear: new Date().getFullYear() + 4, isActive: true },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/academic-years', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic Year created');
      setCreateOpen(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/academic-years/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic Year updated');
      setEditItem(null);
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/academic-years/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic Year deleted');
      setDeleteItem(null);
    },
  });

  const onSubmit = (values: AcademicYearFormValues) => {
    const payload = {
      ...values,
      label: `${values.startYear}-${values.endYear}`
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (item: any) => {
    form.reset({ startYear: item.startYear, endYear: item.endYear, isActive: item.isActive });
    setEditItem(item);
  };

  const columns = [
    { accessorKey: 'label', header: 'Label', cell: ({ row }: any) => <span className="font-semibold text-white">{row.original.label}</span> },
    { accessorKey: 'startYear', header: 'Start Year' },
    { accessorKey: 'endYear', header: 'End Year' },
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
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
            <Edit className="w-4 h-4 text-indigo-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(row.original)}>
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Years"
        subtitle="Manage academic years for batches"
        actions={
          <Button onClick={() => { form.reset(); setCreateOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Year
          </Button>
        }
      />
      <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-4">
        <DataTable columns={columns} data={academicYears || []} isisLoading={isLoading} />
      </div>

      <Dialog open={createOpen || !!editItem} onOpenChange={(open) => {
        if (!open) { setCreateOpen(false); setEditItem(null); }
      }}>
        <DialogContent className="bg-[#0f1117] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Academic Year' : 'Add Academic Year'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startYear" render={({ field }) => (
                  <FormItem><FormLabel>Start Year</FormLabel><FormControl><Input type="number" className="bg-[#1a1d27] border-white/10" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endYear" render={({ field }) => (
                  <FormItem><FormLabel>End Year</FormLabel><FormControl><Input type="number" className="bg-[#1a1d27] border-white/10" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-lg border border-white/10 mt-4">
                  <FormLabel>Active Status</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditItem(null); }} className="border-white/10">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{editItem ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Academic Year" description="Are you sure you want to delete this year? This action cannot be undone."
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)} confirmText="Delete" variant="danger"
      />
    </div>
  );
}
