import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmText?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  variant?: 'default' | 'danger';
  children?: React.ReactNode;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  confirmText,
  loadingLabel,
  isLoading = false,
  variant = 'default',
  children,
}: ConfirmDialogProps) {
  const label = confirmLabel || confirmText || 'Confirm';
  const isDanger = variant === 'danger';

  const activeLabel = loadingLabel || (() => {
    const firstWord = label.split(' ')[0];
    const rest = label.split(' ').slice(1).join(' ');
    return `${firstWord}ing${rest ? ' ' + rest : ''}...`;
  })();

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-md w-full overflow-hidden border-0 shadow-2xl rounded-2xl bg-card">

        <div className="px-7 pt-6 pb-7 space-y-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              isDanger
                ? 'bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30'
                : 'bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30'
            )}>
              <AlertTriangle className={cn(
                'w-6 h-6',
                isDanger
                  ? 'text-yellow-600 dark:text-rose-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              )} />
            </div>

            <div className="space-y-1.5 pt-0.5 flex-1">
              <h2 className="text-base font-bold text-foreground tracking-tight">{title}</h2>
              <p className="text-sm text-muted-foreground font-normal leading-relaxed">{description}</p>
            </div>
          </div>

          {children && (
            <div className="rounded-xl bg-secondary/50 border border-border p-3 text-xs text-muted-foreground">
              {children}
            </div>
          )}

          <div className="h-px bg-border" />

          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText={activeLabel}
              className={cn(
                'min-w-[120px] font-bold text-white',
                isDanger
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 border-0'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 border-0'
              )}
            >
              {isDanger && <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
              {label}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
