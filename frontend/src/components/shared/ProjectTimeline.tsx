import { cn } from '@/lib';
import { Check, Circle, Clock } from 'lucide-react';

interface Stage {
  name: string;
  status: 'done' | 'current' | 'upcoming';
  date?: string;
}

interface ProjectTimelineProps {
  stages: Stage[];
  className?: string;
}

export default function ProjectTimeline({ stages, className }: ProjectTimelineProps) {
  return (
    <div className={cn('relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent', className)}>
      {stages.map((stage, index) => (
        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-foreground relative z-10">
            {stage.status === 'done' && <Check className="w-5 h-5 text-success" />}
            {stage.status === 'current' && <span className="w-3 h-3 bg-brand rounded-full animate-pulse" />}
            {stage.status === 'upcoming' && <Circle className="w-4 h-4 text-neutral-sm" />}
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className={cn('font-bold', stage.status === 'current' ? 'text-brand' : 'text-foreground')}>{stage.name}</div>
              {stage.date && (
                <div className="text-xs font-medium text-dark-muted flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {stage.date}
                </div>
              )}
            </div>
            <div className="text-sm text-dark-muted">
              {stage.status === 'done' ? 'Completed' : stage.status === 'current' ? 'In Progress' : 'Pending'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
