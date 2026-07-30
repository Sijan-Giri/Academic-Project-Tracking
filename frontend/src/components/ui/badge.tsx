import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30',
        secondary: 'border-transparent bg-gray-500/20 text-gray-400 hover:bg-gray-500/30',
        destructive: 'border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
        warning: 'border-transparent bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
