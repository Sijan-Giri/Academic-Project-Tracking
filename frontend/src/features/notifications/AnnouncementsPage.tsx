import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar } from 'lucide-react';
import { getAnnouncements } from '@/api/announcements.api';
import { format } from 'date-fns';

export default function AnnouncementsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => getAnnouncements(),
  });

  // Safe unwrapping for paginated response or plain array
  const announcementList = Array.isArray((response as any)?.data?.items)
    ? (response as any).data.items
    : (Array.isArray((response as any)?.data) ? (response as any).data : (Array.isArray(response) ? response : []));

  if (isLoading) {
    return (
      <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117] max-w-6xl mx-auto">
        <div className="h-20 bg-white/5 animate-pulse rounded-xl border border-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117] max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          Announcements
        </h1>
        <p className="text-slate-400 mt-2">Important updates and notices from coordinators and administrators.</p>
      </div>

      {announcementList.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-200">No announcements yet</h3>
          <p className="text-sm text-slate-400 mt-1">Check back later for department updates and notices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcementList.map((a: any) => {
            const dateVal = a.createdAt || a.date || Date.now();
            const dateStr = format(new Date(dateVal), 'MMMM d, yyyy');
            const targets = a.targets || a.targetDepartments || [];

            return (
              <Card key={a.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-indigo-500/50 transition-colors flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {targets.length > 0 ? (
                        targets.map((t: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="border-white/10 text-slate-300 bg-black/20 text-xs">
                            {t.department?.name || t.departmentId || t.batch?.name || 'Targeted'}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">All Students</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{a.title}</h3>
                  <p className="text-slate-300 text-sm mb-6 flex-1 whitespace-pre-wrap">{a.content}</p>
                  
                  <div className="flex items-center text-xs text-slate-400 mt-auto pt-4 border-t border-white/10">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
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
