import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendLabel?: string;
  className?: string;
}

export default function StatsCard({ icon: Icon, label, value, trend, trendLabel, className }: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-all duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium dark:text-gray-400 text-slate-500">{label}</p>
            <h3 className="mt-2 text-3xl font-bold dark:text-white text-slate-900">{value}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl dark:bg-indigo-500/20 dark:text-indigo-400 bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-xs">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && trendLabel && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn('font-semibold', trend === 'up' ? 'dark:text-emerald-400 text-emerald-600' : 'dark:text-red-400 text-rose-600')}>
              {trend === 'up' ? '↑' : '↓'} {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
