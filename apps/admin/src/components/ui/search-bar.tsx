import * as React from 'react';
import { Search } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchBarProps extends Omit<InputProps, 'type'> {
  wrapperClassName?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, wrapperClassName, placeholder = 'Search', ...props }, ref) => (
    <div className={cn('relative', wrapperClassName)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      />
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={cn('pl-9', className)}
        {...props}
      />
    </div>
  ),
);
SearchBar.displayName = 'SearchBar';

export { SearchBar };
