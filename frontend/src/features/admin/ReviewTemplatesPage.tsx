import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

import { useReviewTemplates, useDepartments } from '@/hooks';
import { PageHeader, DataTable, ConfirmDialog, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Textarea, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components';
import { REVIEW_STAGE_TYPES } from '@/constants';

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
    isSubmitting,
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
    { accessorKey: 'name', header: 'Name', cell: ({ row }: any) => <span className="font-semibold text-foreground">{row.original.name}</span> },
    { accessorKey: 'type', header: 'Type', cell: ({ row }: any) => <Badge variant="outline" className="border-brand text-brand bg-brand-subtle">{row.original.type.replace('_', ' ')}</Badge> },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }: any) => row.original.isDefault ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-dark-muted" />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Stage Templates"
        subtitle="Manage global templates for project review stages"
        actions={
          <Button onClick={() => { form.reset(); setCreateOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Add Template
          </Button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
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
                <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border mt-4">
                  <FormLabel>Is Default Template?</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditItem(null); }}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting} loadingText={editItem ? 'Updating...' : 'Creating...'} className="btn-primary">{editItem ? 'Update' : 'Create'}</Button>
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
