import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export default function LoadingSpinner({ message, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500" />
      {message && <p className="text-sm text-gray-400 animate-pulse">{message}</p>}
    </div>
  );
}
