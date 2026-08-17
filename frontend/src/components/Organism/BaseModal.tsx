import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/components/ui';
import { cn } from '@/lib';
import { Loader2 } from 'lucide-react';

export interface IBaseModal {
  isOpen: boolean;
  title?: string;
  setIsOpen: (open: boolean) => void;
  disableOutsideClick?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'destructive';
  onConfirm?: () => void;
  onCancel?: () => void;
  proceedText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  description?: string;
  viewOnly?: boolean;
  footerLeftContent?: React.ReactNode;
  showModalFooter?: boolean;
}

export default function BaseModal({
  isOpen,
  setIsOpen,
  title,
  disableOutsideClick,
  className,
  onConfirm,
  onCancel,
  children,
  isLoading,
  isDisabled,
  description,
  proceedText = 'Proceed',
  cancelText = 'Cancel',
  variant = 'primary',
  viewOnly,
  footerLeftContent,
  showModalFooter = true,
}: IBaseModal) {
  const handleClose = () => {
    if (onCancel) onCancel();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn('p-0 gap-0 z-50 rounded-2xl overflow-hidden bg-card border-border shadow-2xl', className)}
        onInteractOutside={(e) => {
          if (disableOutsideClick || isLoading) e.preventDefault();
        }}
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-base font-bold text-foreground">
            {title ?? 'Confirmation'}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground text-left mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

        {showModalFooter && (
          <div className="px-6 py-4 flex items-center justify-between gap-3 border-t border-border bg-secondary/30">
            <div>{footerLeftContent}</div>
            {viewOnly ? (
              <Button variant="outline" onClick={handleClose} className="rounded-xl px-5 text-xs font-semibold">
                Close
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-xl px-4 text-xs font-semibold"
                >
                  {cancelText}
                </Button>
                <Button
                  variant={variant === 'destructive' ? 'destructive' : 'default'}
                  onClick={onConfirm}
                  disabled={isLoading || isDisabled}
                  className={cn(
                    'rounded-xl px-5 text-xs font-semibold',
                    variant === 'primary' && 'btn-primary'
                  )}
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  {proceedText}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { BaseModal };
