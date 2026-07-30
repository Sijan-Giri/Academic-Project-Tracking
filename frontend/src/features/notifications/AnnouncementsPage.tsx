import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar } from 'lucide-react';
import { getAnnouncements } from '@/api/announcements';
import { format } from 'date-fns';

export default function AnnouncementsPage() {
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements'], queryFn: getAnnouncements });

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          Announcements
        </h1>
        <p className="text-slate-400 mt-2">Important updates and notices from coordinators and admins.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-300">No announcements yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a: any) => (
            <Card key={a.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-violet-500/50 transition-colors flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {a.targetDepartments?.length > 0 ? (
                      a.targetDepartments.map((d: string) => (
                        <Badge key={d} variant="outline" className="border-white/10 text-slate-300 bg-black/20">
                          {d}
                        </Badge>
                      ))
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-400">All Students</Badge>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">{a.title}</h3>
                <p className="text-slate-300 text-sm mb-6 flex-1 whitespace-pre-wrap">{a.content}</p>
                
                <div className="flex items-center text-xs text-slate-500 mt-auto pt-4 border-t border-white/10">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(a.date), 'MMMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
