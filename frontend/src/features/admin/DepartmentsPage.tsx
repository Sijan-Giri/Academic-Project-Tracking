import { useDepartments } from '@/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';

import { PageHeader, DataTable, ConfirmDialog, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Textarea, Switch } from '@/components';
import type { Department } from '@/types/system.types';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().max(5, 'Max 5 characters').min(2, 'Code is required').toUpperCase(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

import React, { useState } from 'react';

export default function DepartmentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Department | null>(null);
  const [deleteItem, setDeleteItem] = useState<Department | null>(null);

  const {
    departments,
    isLoading,
    isSubmitting,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();

  const handleCreate = async (data: DepartmentFormValues) => {
    try {
      await createDepartment(data);
      setCreateOpen(false);
      form.reset();
    } catch (_) {}
  };

  const handleUpdate = async (data: DepartmentFormValues) => {
    if (!editItem) return;
    try {
      await updateDepartment({ id: editItem.id, data });
      setEditItem(null);
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteDepartment(deleteItem.id);
      setDeleteItem(null);
    } catch (_) {}
  };

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
      handleUpdate(values);
    } else {
      handleCreate(values);
    }
  };

  const columns = [
    { accessorKey: 'code', header: 'Code', cell: ({ row }: any) => <span className="font-semibold text-foreground">{row.original.code}</span> },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'btn-primary' : ''}>
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
            <Edit className="w-4 h-4 text-brand" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(row.original)}>
            <Trash2 className="w-4 h-4 text-danger" />
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
          <Button onClick={() => { form.reset(); setCreateOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        }
      />

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
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
                <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border">
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
                <Button type="submit" isLoading={isSubmitting} loadingText={editItem ? 'Updating...' : 'Creating...'} className="btn-primary">
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
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
