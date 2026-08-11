import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Upload, Search, Power, PowerOff } from 'lucide-react';

import { useUsers } from '@/hooks/useUsers';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_OPTIONS } from '@/constants/options';

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['ADMIN', 'COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT']),
  studentId: z.string().optional(),
  batchId: z.string().optional(),
  semesterId: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [_importOpen, setImportOpen] = useState(false);

  const {
    users,
    departments,
    batches,
    isLoading,
    createUser,
    toggleUserStatus,
    isSubmitting,
  } = useUsers({ role: roleFilter === 'ALL' ? undefined : roleFilter, search });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'STUDENT' },
  });

  const watchRole = form.watch('role');

  const onSubmit = async (values: UserFormValues) => {
    try {
      await createUser(values);
      setCreateOpen(false);
      form.reset();
    } catch (_) {}
  };

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="text-brand border-brand bg-brand-subtle">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-success-solid' : ''}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { accessorKey: 'createdAt', header: 'Joined', cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString() },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => toggleUserStatus({ id: row.original.id, isActive: row.original.isActive })}>
            {row.original.isActive ? <PowerOff className="w-4 h-4 text-warning" /> : <Power className="w-4 h-4 text-success" />}
          </Button>
        </div>
      ),
    },
  ];

  const userList = users;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage students, faculty, and coordinators"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)} className="border-white/10">
              <Upload className="w-4 h-4 mr-2" /> Bulk Import
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </div>
        }
      />

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-sm" />
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map(role => (
              <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <DataTable columns={columns} data={userList} isLoading={isLoading} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Select role" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {watchRole === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="studentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID (Roll No)</FormLabel>
                      <FormControl><Input className="bg-card border-border" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="batchId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Select batch" /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          {batches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              )}

              {(watchRole === 'FACULTY' || watchRole === 'COORDINATOR' || watchRole === 'PANEL') && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="departmentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Select department" /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="designation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl><Input className="bg-card border-border" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-border">Cancel</Button>
                <Button type="submit" isLoading={isSubmitting} loadingText="Creating User..." className="btn-primary">Create User</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
