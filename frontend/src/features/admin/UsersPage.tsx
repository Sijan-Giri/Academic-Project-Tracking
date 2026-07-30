import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Upload, Search, Edit, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Department, Batch } from '@/types';

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', roleFilter, search],
    queryFn: async () => {
      const res = await api.get('/users', { params: { role: roleFilter === 'ALL' ? undefined : roleFilter, search } });
      return res.data;
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data,
  });

  const { data: batches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => (await api.get('/batches')).data,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'STUDENT' },
  });

  const watchRole = form.watch('role');

  const createMutation = useMutation({
    mutationFn: (data: UserFormValues) => api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setCreateOpen(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create user'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/${id}/${isActive ? 'deactivate' : 'activate'}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
  });

  const onSubmit = (values: UserFormValues) => createMutation.mutate(values);

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-emerald-500' : ''}>
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
          <Button variant="ghost" size="icon" onClick={() => toggleStatusMutation.mutate({ id: row.original.id, isActive: row.original.isActive })}>
            {row.original.isActive ? <PowerOff className="w-4 h-4 text-orange-400" /> : <Power className="w-4 h-4 text-emerald-400" />}
          </Button>
        </div>
      ),
    },
  ];

  const userList = Array.isArray((users as any)?.data?.items) ? (users as any).data.items : (Array.isArray((users as any)?.data) ? (users as any).data : (Array.isArray(users) ? users : ((users as any)?.items || [])));

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
            <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </div>
        }
      />

      <div className="flex gap-4 items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1a1d27] border-white/10 text-white"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] bg-[#1a1d27] border-white/10">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="FACULTY">Faculty</SelectItem>
            <SelectItem value="COORDINATOR">Coordinator</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-4">
        <DataTable columns={columns} data={userList} isLoading={isLoading} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0f1117] border-white/10 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input className="bg-[#1a1d27] border-white/10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" className="bg-[#1a1d27] border-white/10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1a1d27] border-white/10"><SelectValue placeholder="Select role" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1a1d27] border-white/10">
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
                      <FormControl><Input className="bg-[#1a1d27] border-white/10" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="batchId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#1a1d27] border-white/10"><SelectValue placeholder="Select batch" /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1a1d27] border-white/10">
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
                          <SelectTrigger className="bg-[#1a1d27] border-white/10"><SelectValue placeholder="Select department" /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1a1d27] border-white/10">
                          {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="designation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl><Input className="bg-[#1a1d27] border-white/10" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-white/10">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create User</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
