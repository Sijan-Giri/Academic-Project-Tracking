import { Switch, Label } from '@/components/ui';
import { cn } from '@/lib';

interface SwitchWithLabelProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function SwitchWithLabel({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: SwitchWithLabelProps) {
  const switchId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cn('flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border', className)}>
      <div className="space-y-0.5">
        <Label htmlFor={switchId} className="text-sm font-medium text-foreground cursor-pointer">
          {label}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={switchId} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export { SwitchWithLabel };
