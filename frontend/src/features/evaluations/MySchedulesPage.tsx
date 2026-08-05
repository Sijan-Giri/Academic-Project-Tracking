import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { MapPin, Users, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { useMySchedules } from '@/hooks/useMySchedules';

export default function MySchedulesPage() {
  const navigate = useNavigate();
  const { schedules } = useMySchedules();

  const [activeTab, setActiveTab] = useState('upcoming');

  const upcoming = schedules.filter((s: any) => {
    const sDate = s.scheduledAt || s.date;
    return (sDate && isFuture(new Date(sDate))) || !s.isCompleted;
  });

  const past = schedules.filter((s: any) => {
    const sDate = s.scheduledAt || s.date;
    return (sDate && isPast(new Date(sDate))) && s.isCompleted;
  });

  const renderScheduleList = (list: any[]) => (
    <div className="space-y-4 mt-4">
      {list.length === 0 ? (
        <EmptyState icon={CalendarIcon} title="No Schedules Found" description="You have no presentation schedules assigned for this category." />
      ) : (
        list.map((s: any) => {
          const sDate = s.scheduledAt || s.date;
          const dateObj = sDate ? new Date(sDate) : new Date();

          return (
            <Card key={s.id} className="overflow-hidden border border-border shadow-xs hover:border-indigo-500/50 transition-colors">
              <CardContent className="p-0 flex flex-col md:flex-row">
                {/* Left Date Section */}
                <div className="bg-secondary/60 md:w-32 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border text-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">{format(dateObj, 'dd')}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{format(dateObj, 'MMM')}</span>
                  <span className="text-[11px] text-muted-foreground mt-1 font-medium">{format(dateObj, 'h:mm a')}</span>
                </div>
                
                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-center space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold">
                      {s.reviewStage?.name || 'Presentation Slot'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                      s.mode === 'ONLINE' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-secondary text-foreground border-border'
                    }`}>
                      {s.mode || 'OFFLINE'}
                    </span>
                    {s.isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 ml-auto">
                        Completed
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 ml-auto">
                        Pending Evaluation
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-foreground tracking-tight">{s.project?.title || 'Student Project Presentation'}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-normal">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {s.project?.team?.name || s.team?.name || 'Student Team'}
                    </span>
                    <span className="flex items-center gap-1.5 font-normal">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {s.venue || 'Venue TBD'}
                    </span>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="p-5 border-t md:border-t-0 md:border-l border-border flex flex-col md:w-52 justify-center space-y-3 bg-secondary/20">
                  {!s.isCompleted && (
                    <Button 
                      className="btn-primary w-full text-xs font-semibold"
                      onClick={() => navigate(`/evaluations/${s.id}`)}
                    >
                      Evaluate Panel <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold">Attendance</span>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Review Schedules"
        subtitle="View panel presentation slots assigned to you, evaluate student projects, and log attendance."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground font-semibold text-xs rounded-lg px-4 py-2">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground font-semibold text-xs rounded-lg px-4 py-2">
            Completed ({past.length})
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
