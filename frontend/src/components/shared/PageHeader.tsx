import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center', className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm dark:text-gray-400 text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}
