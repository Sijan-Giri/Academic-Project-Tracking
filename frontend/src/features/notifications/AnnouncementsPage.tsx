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
        <div className="h-20 bg-neutral-subtle animate-pulse rounded-xl border-border" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-neutral-subtle animate-pulse rounded-2xl border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text-brand">
          Announcements
        </h1>
        <p className="text-neutral-sm mt-2">Important updates and notices from coordinators and administrators.</p>
      </div>

      {announcementList.length === 0 ? (
        <div className="text-center py-20 bg-card border-border shadow-sm rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-brand-subtle flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-brand" />
          </div>
          <h3 className="text-xl font-medium text-foreground">No announcements yet</h3>
          <p className="text-sm text-neutral-sm mt-1">Check back later for department updates and notices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcementList.map((a: any) => {
            const dateVal = a.createdAt || a.date || Date.now();
            const dateStr = format(new Date(dateVal), 'MMMM d, yyyy');
            const targets = a.targets || a.targetDepartments || [];

            return (
              <Card key={a.id} className="hover:border-brand transition-colors flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-subtle flex items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {targets.length > 0 ? (
                        targets.map((t: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="border-border text-neutral-md bg-neutral-subtle text-xs">
                            {t.department?.name || t.departmentId || t.batch?.name || 'Targeted'}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="bg-success-subtle text-success-md border border-success text-xs">All Students</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{a.title}</h3>
                  <p className="text-neutral-md text-sm mb-6 flex-1 whitespace-pre-wrap">{a.content}</p>
                  
                  <div className="flex items-center text-xs text-neutral-sm mt-auto pt-4 border-t border-border">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand" />
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
