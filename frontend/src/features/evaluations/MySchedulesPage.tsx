import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { MapPin, Users, CalendarDays, ExternalLink } from 'lucide-react';
import { getMySchedules } from '@/api/schedules';
import { format, isPast, isFuture, parseISO } from 'date-fns';
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
        <div className="text-center py-12 text-slate-500">No schedules found.</div>
      ) : (
        list.map((s: any) => (
          <Card key={s.id} className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden hover:border-white/20 transition-colors">
            <CardContent className="p-0 flex flex-col md:flex-row">
              {/* Left Date Section */}
              <div className="bg-gradient-to-b from-indigo-500/20 to-violet-600/20 md:w-32 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 text-center">
                <span className="text-3xl font-bold text-indigo-400">{format(new Date(s.date), 'dd')}</span>
                <span className="text-sm font-medium uppercase tracking-widest text-slate-300">{format(new Date(s.date), 'MMM')}</span>
                <span className="text-xs text-slate-500 mt-1">{format(new Date(s.date), 'h:mm a')}</span>
              </div>
              
              {/* Content Section */}
              <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-slate-800 text-slate-300">{s.reviewStage?.name || 'Review'}</Badge>
                  <Badge className={s.mode === 'ONLINE' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'}>
                    {s.mode}
                  </Badge>
                  {s.status === 'COMPLETED' ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 ml-auto">Completed</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 ml-auto">Pending</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{s.project?.title || 'Project Title'}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {s.team?.name || 'Team Name'}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {s.venue || 'TBA'}</span>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-4 md:p-6 border-t md:border-t-0 md:border-l border-white/10 flex flex-col md:w-48 justify-center space-y-4 bg-black/20">
                {s.status !== 'COMPLETED' && (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => navigate(`/evaluations/${s.id}`)}
                  >
                    Enter Evaluation <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Mark Attendance</span>
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
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          My Review Schedules
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1">
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
