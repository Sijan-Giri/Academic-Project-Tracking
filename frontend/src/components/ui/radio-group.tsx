import * as React from 'react';
import { Circle } from 'lucide-react';
import { cn } from '@/lib';

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value: valueProp, defaultValue, onValueChange, name, disabled, children, ...props }, ref) => {
    const [value, setValue] = React.useState(valueProp ?? defaultValue ?? '');

    React.useEffect(() => {
      if (valueProp !== undefined) {
        setValue(valueProp);
      }
    }, [valueProp]);

    const handleValueChange = React.useCallback(
      (val: string) => {
        if (valueProp === undefined) {
          setValue(val);
        }
        onValueChange?.(val);
      },
      [valueProp, onValueChange]
    );

    return (
      <RadioGroupContext.Provider value={{ value, onValueChange: handleValueChange, name, disabled }}>
        <div ref={ref} className={cn('grid gap-2', className)} role="radiogroup" {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled: itemDisabled, onClick, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const checked = context.value === value;
    const disabled = context.disabled || itemDisabled;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      context.onValueChange?.(value);
      onClick?.(e);
    };

    return (
      <button
        type="button"
        ref={ref}
        role="radio"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'aspect-square h-4 w-4 rounded-full border border-border text-brand ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors',
          checked && 'border-indigo-500 bg-indigo-500/20',
          className
        )}
        {...props}
      >
        {checked && <Circle className="h-2.5 w-2.5 fill-current text-brand" />}
      </button>
    );
  }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
