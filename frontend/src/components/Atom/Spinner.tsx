import { Loader2 } from 'lucide-react';
import { cn } from '@/lib';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export default function Spinner({ size = 'md', className, message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-brand', sizeMap[size], className)} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export { Spinner };
