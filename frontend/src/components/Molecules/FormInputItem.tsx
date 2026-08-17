import React from 'react';
import { Label, Input } from '@/components/ui';
import { cn } from '@/lib';

interface FormInputItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  requiredStar?: boolean;
}

export default function FormInputItem({
  label,
  error,
  requiredStar,
  className,
  id,
  ...props
}: FormInputItemProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={inputId} className="text-xs font-semibold text-foreground flex items-center gap-1">
        {label}
        {requiredStar && <span className="text-danger">*</span>}
      </Label>
      <Input id={inputId} {...props} className={cn(error && 'border-danger focus-visible:ring-danger')} />
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}

export { FormInputItem };
