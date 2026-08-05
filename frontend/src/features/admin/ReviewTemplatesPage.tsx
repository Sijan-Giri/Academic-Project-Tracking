import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

import { useReviewTemplates } from '@/hooks/useReviewTemplates';
import { useDepartments } from '@/hooks/useDepartments';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const REVIEW_STAGE_TYPES = ['ABSTRACT_REVIEW', 'REVIEW_1', 'REVIEW_2', 'REVIEW_3', 'PRE_SUBMISSION', 'FINAL_SUBMISSION'];

const templateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['ABSTRACT_REVIEW', 'REVIEW_1', 'REVIEW_2', 'REVIEW_3', 'PRE_SUBMISSION', 'FINAL_SUBMISSION']),
  description: z.string().optional(),
  order: z.coerce.number().min(1),
  isDefault: z.boolean().default(false),
  departmentId: z.string().optional().nullable(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export default function ReviewTemplatesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useReviewTemplates();

  const { departments } = useDepartments();

  const handleCreate = async (data: TemplateFormValues) => {
    try {
      await createTemplate({ ...data, departmentId: data.departmentId || undefined });
      setCreateOpen(false);
      form.reset();
    } catch (_) {}
  };

  const handleUpdate = async (data: TemplateFormValues) => {
    if (!editItem) return;
    try {
      await updateTemplate({ id: editItem.id, data: { ...data, departmentId: data.departmentId || undefined } });
      setEditItem(null);
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteTemplate(deleteItem.id);
      setDeleteItem(null);
    } catch (_) {}
  };

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: '', type: 'REVIEW_1', description: '', order: 1, isDefault: false, departmentId: null },
  });

  const onSubmit = (values: TemplateFormValues) => {
    if (editItem) handleUpdate(values);
    else handleCreate(values);
  };

  const handleEdit = (item: any) => {
    form.reset({
      name: item.name,
      type: item.type,
      description: item.description || '',
      order: item.order,
      isDefault: item.isDefault,
      departmentId: item.departmentId || null,
    });
    setEditItem(item);
  };

  const columns = [
    { accessorKey: 'order', header: 'Order' },
    { accessorKey: 'name', header: 'Name', cell: ({ row }: any) => <span className="font-semibold dark:text-white text-slate-900">{row.original.name}</span> },
    { accessorKey: 'type', header: 'Type', cell: ({ row }: any) => <Badge variant="outline" className="dark:border-indigo-500/30 dark:text-indigo-400 dark:bg-indigo-500/10 border-indigo-200 text-indigo-700 bg-indigo-50">{row.original.type.replace('_', ' ')}</Badge> },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }: any) => row.original.isDefault ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-slate-400" />,
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
        title="Review Stage Templates"
        subtitle="Manage global templates for project review stages"
        actions={
          <Button onClick={() => { form.reset(); setCreateOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Template
          </Button>
        }
      />
      <div className="dark:bg-[#1a1d27] bg-white rounded-xl border dark:border-white/10 border-slate-200 p-4 shadow-sm">
        <DataTable columns={columns} data={templates || []} isLoading={isLoading} />
      </div>

      <Dialog open={createOpen || !!editItem} onOpenChange={(open) => {
        if (!open) { setCreateOpen(false); setEditItem(null); }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Template' : 'Add Template'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="order" render={({ field }) => (
                  <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {REVIEW_STAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="departmentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === 'ALL' ? null : val)} value={field.value || 'ALL'}>
                      <FormControl><SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">All Departments</SelectItem>
                        {departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="isDefault" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-lg border dark:border-white/10 border-slate-200 mt-4">
                  <FormLabel>Is Default Template?</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditItem(null); }}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">{editItem ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Template" description="Are you sure you want to delete this review template?"
        onConfirm={handleDelete} confirmText="Delete" variant="danger"
      />
    </div>
  );
}
