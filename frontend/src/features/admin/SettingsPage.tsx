import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

import { api } from '@/api/client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const settingsSchema = z.object({
  max_team_size: z.coerce.number().min(1).max(10),
  min_team_size: z.coerce.number().min(1).max(10),
  abstract_max_words: z.coerce.number().min(100),
  plagiarism_threshold: z.coerce.number().min(0).max(100),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      // Assume API returns array of key-value or an object map
      // For form defaultValues, we map it back to object
      const defaultValues: any = {};
      if (Array.isArray(res.data)) {
         res.data.forEach((s: any) => defaultValues[s.key] = s.value);
      }
      return defaultValues;
    },
  });

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: settings || {
      max_team_size: 4,
      min_team_size: 2,
      abstract_max_words: 500,
      plagiarism_threshold: 15,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SettingsValues) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => toast.error('Failed to update settings'),
  });

  const onSubmit = (values: SettingsValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings"
        subtitle="Configure global parameters for the tracking system"
      />

      <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <FormField control={form.control} name="max_team_size" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base text-white">Maximum Team Size</FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-[#0f1117] border-white/10 text-white" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Maximum number of students allowed in a single project team.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="min_team_size" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base text-white">Minimum Team Size</FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-[#0f1117] border-white/10 text-white" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Minimum number of students required to form a project team.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="abstract_max_words" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base text-white">Abstract Max Words</FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-[#0f1117] border-white/10 text-white" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Maximum word limit for project abstract submissions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="plagiarism_threshold" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base text-white">Plagiarism Threshold (%)</FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-[#0f1117] border-white/10 text-white" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Percentage threshold for flagging similarity in submitted documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8" disabled={updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> 
                {updateMutation.isPending ? 'Saving...' : 'Save All Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
