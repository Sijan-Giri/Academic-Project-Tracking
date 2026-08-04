import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { MapPin, Users, ExternalLink } from 'lucide-react';
import { getMySchedules } from '@/api/schedules.api';
import { format, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function MySchedulesPage() {
  const navigate = useNavigate();
  const { data: schedules = [] } = useQuery({ queryKey: ['my-schedules'], queryFn: getMySchedules });
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcoming = schedules.filter((s: any) => isFuture(new Date(s.date)) || s.status === 'PENDING');
  const past = schedules.filter((s: any) => isPast(new Date(s.date)) && s.status === 'COMPLETED');

  const renderScheduleList = (list: any[]) => (
    <div className="space-y-4 mt-6">
      {list.length === 0 ? (
        <div className="text-center py-12 dark:text-slate-500 text-slate-400 font-medium">No schedules found.</div>
      ) : (
        list.map((s: any) => (
          <Card key={s.id} className="overflow-hidden dark:hover:border-white/20 hover:border-slate-300 transition-colors">
            <CardContent className="p-0 flex flex-col md:flex-row">
              {/* Left Date Section */}
              <div className="bg-gradient-to-b dark:from-indigo-500/20 dark:to-violet-600/20 from-indigo-50 to-violet-100 md:w-32 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r dark:border-white/10 border-slate-200 text-center">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{format(new Date(s.date), 'dd')}</span>
                <span className="text-sm font-medium uppercase tracking-widest dark:text-slate-300 text-slate-700">{format(new Date(s.date), 'MMM')}</span>
                <span className="text-xs dark:text-slate-500 text-slate-500 mt-1">{format(new Date(s.date), 'h:mm a')}</span>
              </div>
              
              {/* Content Section */}
              <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="dark:bg-slate-800 dark:text-slate-300 bg-slate-100 text-slate-700">{s.reviewStage?.name || 'Review'}</Badge>
                  <Badge className={s.mode === 'ONLINE' ? 'dark:bg-indigo-500/20 dark:text-indigo-400 bg-indigo-100 text-indigo-700' : 'dark:bg-slate-700 dark:text-slate-300 bg-slate-100 text-slate-700'}>
                    {s.mode}
                  </Badge>
                  {s.status === 'COMPLETED' ? (
                    <Badge className="dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-700 border border-emerald-300 ml-auto">Completed</Badge>
                  ) : (
                    <Badge className="dark:bg-yellow-500/20 dark:text-yellow-400 bg-amber-100 text-amber-800 border border-amber-300 ml-auto">Pending</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-1">{s.project?.title || 'Project Title'}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm dark:text-slate-400 text-slate-500">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {s.team?.name || 'Team Name'}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {s.venue || 'TBA'}</span>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-4 md:p-6 border-t md:border-t-0 md:border-l dark:border-white/10 border-slate-200 flex flex-col md:w-48 justify-center space-y-4 dark:bg-black/20 bg-slate-50">
                {s.status !== 'COMPLETED' && (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => navigate(`/evaluations/${s.id}`)}
                  >
                    Enter Evaluation <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-slate-300 text-slate-700 font-medium">Mark Attendance</span>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          My Review Schedules
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 p-1">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            Past ({past.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {renderScheduleList(upcoming)}
        </TabsContent>
        <TabsContent value="past">
          {renderScheduleList(past)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
