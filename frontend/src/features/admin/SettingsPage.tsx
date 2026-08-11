import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save } from 'lucide-react';

import { useSettings } from '@/hooks/useSettings';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { SettingsSkeleton } from '@/components/shared/Skeletons';
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
  const { settings, isLoading, updateSetting, isUpdating: isSubmitting } = useSettings();

  const settingsMap: Record<string, any> = {};
  if (Array.isArray(settings)) {
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });
  }

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: Object.keys(settingsMap).length > 0 ? settingsMap as any : {
      max_team_size: 4,
      min_team_size: 2,
      abstract_max_words: 500,
      plagiarism_threshold: 15,
    },
  });

  const onSubmit = async (values: SettingsValues) => {
    try {
      for (const [key, value] of Object.entries(values)) {
        await updateSetting({ key, value: String(value) });
      }
    } catch (_) {}
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings"
        subtitle="Configure global parameters for the tracking system"
      />

      <div className="dark:bg-[#1a1d27] bg-white rounded-xl border dark:border-white/10 border-slate-200 p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <FormField control={form.control} name="max_team_size" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold dark:text-white text-slate-900">Maximum Team Size</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription className="dark:text-gray-400 text-slate-500">
                    Maximum number of students allowed in a single project team.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="min_team_size" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold dark:text-white text-slate-900">Minimum Team Size</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription className="dark:text-gray-400 text-slate-500">
                    Minimum number of students required to form a project team.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="abstract_max_words" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold dark:text-white text-slate-900">Abstract Max Words</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription className="dark:text-gray-400 text-slate-500">
                    Maximum word limit for project abstract submissions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="plagiarism_threshold" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold dark:text-white text-slate-900">Plagiarism Threshold (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription className="dark:text-gray-400 text-slate-500">
                    Percentage threshold for flagging similarity in submitted documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

            <div className="flex justify-end pt-4 border-t dark:border-white/10 border-slate-200">
              <Button type="submit" isLoading={isSubmitting} loadingText="Saving All Settings..." className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8">
                <Save className="w-4 h-4 mr-2" /> 
                Save All Settings
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
