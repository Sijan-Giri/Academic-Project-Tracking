import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAnnouncements } from '@/hooks/useAnnouncements';

export default function AnnouncementsPage() {
  const { announcements: announcementList, isLoading } = useAnnouncements();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="h-20 dark:bg-white/5 bg-slate-200 animate-pulse rounded-xl dark:border-white/10 border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 dark:bg-white/5 bg-slate-200 animate-pulse rounded-2xl dark:border-white/10 border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          Announcements
        </h1>
        <p className="dark:text-slate-400 text-slate-500 mt-2">Important updates and notices from coordinators and administrators.</p>
      </div>

      {announcementList.length === 0 ? (
        <div className="text-center py-20 dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="w-16 h-16 rounded-full dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-medium dark:text-slate-200 text-slate-800">No announcements yet</h3>
          <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">Check back later for department updates and notices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcementList.map((a: any) => {
            const dateVal = a.createdAt || a.date || Date.now();
            const dateStr = format(new Date(dateVal), 'MMMM d, yyyy');
            const targets = a.targets || a.targetDepartments || [];

            return (
              <Card key={a.id} className="hover:border-indigo-500/50 transition-colors flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="w-10 h-10 rounded-full dark:bg-indigo-500/20 bg-indigo-100 flex items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {targets.length > 0 ? (
                        targets.map((t: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="dark:border-white/10 dark:text-slate-300 dark:bg-black/20 border-slate-200 text-slate-700 bg-slate-100 text-xs">
                            {t.department?.name || t.departmentId || t.batch?.name || 'Targeted'}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs">All Students</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold dark:text-white text-slate-900 mb-2 leading-tight">{a.title}</h3>
                  <p className="dark:text-slate-300 text-slate-700 text-sm mb-6 flex-1 whitespace-pre-wrap">{a.content}</p>
                  
                  <div className="flex items-center text-xs dark:text-slate-400 text-slate-500 mt-auto pt-4 border-t dark:border-white/10 border-slate-200">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                    {dateStr}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
