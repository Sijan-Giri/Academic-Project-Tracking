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
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{label}</p>
            <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && trendLabel && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn('font-medium', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
              {trend === 'up' ? '↑' : '↓'} {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
