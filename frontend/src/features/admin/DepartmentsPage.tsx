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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Department } from '@/types';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().max(5, 'Max 5 characters').min(2, 'Code is required').toUpperCase(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Department | null>(null);
  const [deleteItem, setDeleteItem] = useState<Department | null>(null);

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DepartmentFormValues) => api.post('/departments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
      setCreateOpen(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create department'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormValues }) => api.put(`/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
      setEditItem(null);
    },
    onError: () => toast.error('Failed to update department'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
      setDeleteItem(null);
    },
    onError: () => toast.error('Failed to delete department'),
  });

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
    },
  });

  const handleEdit = (dept: Department) => {
    form.reset({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      isActive: dept.isActive,
    });
    setEditItem(dept);
  };

  const onSubmit = (values: DepartmentFormValues) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    { accessorKey: 'code', header: 'Code', cell: ({ row }: any) => <span className="font-semibold dark:text-white text-slate-900">{row.original.code}</span> },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : ''}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { accessorKey: 'hod', header: 'HOD', cell: ({ row }: any) => row.original.hod?.name || 'Unassigned' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
            <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(row.original)}>
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  const deptList = Array.isArray((departments as any)?.data) ? (departments as any).data : (Array.isArray(departments) ? departments : ((departments as any)?.data?.items || []));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage institution departments"
        actions={
          <Button onClick={() => { form.reset(); setCreateOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        }
      />

      <div className="dark:bg-[#1a1d27] bg-white rounded-xl border dark:border-white/10 border-slate-200 p-4 shadow-sm">
        <DataTable columns={columns} data={deptList} isLoading={isLoading} />
      </div>

      <Dialog open={createOpen || !!editItem} onOpenChange={(open) => {
        if (!open) { setCreateOpen(false); setEditItem(null); }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="CS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-lg border dark:border-white/10 border-slate-200">
                  <FormLabel>Active Status</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditItem(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {editItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Department"
        description={`Are you sure you want to delete ${deleteItem?.name}? This action cannot be undone.`}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
