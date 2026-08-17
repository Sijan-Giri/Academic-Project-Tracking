import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
}

export default function SearchInput({
  value,
  onValueChange,
  className,
  placeholder = 'Search...',
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        {...props}
        value={value}
        type="search"
        placeholder={placeholder}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />
    </div>
  );
}

export { SearchInput };
