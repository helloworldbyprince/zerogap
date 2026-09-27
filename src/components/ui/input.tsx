import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[10px] border border-[#E3E7EE] bg-[#F6F7F9] px-3 py-2 text-xs sm:text-sm text-[#111418] placeholder:text-[#5F6B7A] transition-colors focus:outline-none focus:border-[#F5A524] focus:bg-white focus:ring-1 focus:ring-[#F5A524] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
