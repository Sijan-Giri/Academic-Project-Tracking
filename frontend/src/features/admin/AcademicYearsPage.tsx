import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';

import { useAcademicYears } from '@/hooks/useAcademicYears';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AcademicYear } from '@/types/system.types';

const academicYearSchema = z.object({
  startYear: z.coerce.number().int().min(2000).max(2100),
  endYear: z.coerce.number().int().min(2000).max(2100),
  isActive: z.boolean().default(true),
}).refine(data => data.endYear > data.startYear, {
  message: "End year must be after start year",
  path: ["endYear"],
});

type AcademicYearFormValues = z.infer<typeof academicYearSchema>;

export default function AcademicYearsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicYear | null>(null);
  const [deleteItem, setDeleteItem] = useState<AcademicYear | null>(null);

  const {
    academicYears: yearList,
    isLoading,
    isSubmitting,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
  } = useAcademicYears();

  const form = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: { startYear: new Date().getFullYear(), endYear: new Date().getFullYear() + 4, isActive: true },
  });

  const handleCreate = async (data: any) => {
    try {
      await createAcademicYear(data);
      setCreateOpen(false);
      form.reset();
    } catch (_) {}
  };

  const handleUpdate = async (data: any) => {
    if (!editItem) return;
    try {
      await updateAcademicYear({ id: editItem.id, data });
      setEditItem(null);
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteAcademicYear(deleteItem.id);
      setDeleteItem(null);
    } catch (_) {}
  };

  const onSubmit = (values: AcademicYearFormValues) => {
    const payload = {
      ...values,
      label: `${values.startYear}-${values.endYear}`
    };
    if (editItem) {
      handleUpdate(payload);
    } else {
      handleCreate(payload);
    }
  };

  const handleEdit = (item: any) => {
    form.reset({ startYear: item.startYear, endYear: item.endYear, isActive: item.isActive });
    setEditItem(item);
  };

  const columns = [
    { accessorKey: 'label', header: 'Label', cell: ({ row }: any) => <span className="font-semibold dark:text-white text-slate-900">{row.original.label}</span> },
    { accessorKey: 'startYear', header: 'Start Year' },
    { accessorKey: 'endYear', header: 'End Year' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : ''}>
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
            <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(row.original)}>
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-red-400" />
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
          <Button onClick={() => { form.reset(); setCreateOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Year
          </Button>
        }
      />
      <div className="dark:bg-[#1a1d27] bg-white rounded-xl border dark:border-white/10 border-slate-200 p-4 shadow-sm">
        <DataTable columns={columns} data={yearList} isLoading={isLoading} />
      </div>

      <Dialog open={createOpen || !!editItem} onOpenChange={(open) => {
        if (!open) { setCreateOpen(false); setEditItem(null); }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Academic Year' : 'Add Academic Year'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startYear" render={({ field }) => (
                  <FormItem><FormLabel>Start Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endYear" render={({ field }) => (
                  <FormItem><FormLabel>End Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-lg border dark:border-white/10 border-slate-200 mt-4">
                  <FormLabel>Active Status</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditItem(null); }}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting} loadingText={editItem ? 'Updating...' : 'Creating...'} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {editItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Academic Year" description="Are you sure you want to delete this year? This action cannot be undone."
        onConfirm={handleDelete} confirmText="Delete" variant="danger"
      />
    </div>
  );
}
