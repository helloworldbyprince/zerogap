import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[15px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-[#F5A524] text-[#1A1A1A] hover:bg-[#e0941d] shadow-xs font-medium',
        amber:
          'bg-[#F5A524] text-[#1A1A1A] hover:bg-[#e0941d] shadow-xs font-medium',
        secondary:
          'bg-white text-[#111418] border border-[#E3E7EE] hover:bg-[#F6F7F9] shadow-xs',
        ghost:
          'bg-transparent text-[#5F6B7A] hover:bg-[#F0F2F5] hover:text-[#111418]',
        outline:
          'border border-[#E3E7EE] bg-white text-[#111418] hover:bg-[#F6F7F9] shadow-xs',
        danger:
          'bg-[#F31260]/10 text-[#C70E4E] border border-[#F31260]/25 hover:bg-[#F31260]/20',
        success:
          'bg-[#17C964]/10 text-[#0F8C43] border border-[#17C964]/25 hover:bg-[#17C964]/20',
      },
      size: {
        default: 'h-10 px-5 py-2 rounded-[12px]',
        sm: 'h-8 px-3.5 py-1 rounded-[10px] text-xs',
        lg: 'h-12 px-7 py-3 rounded-[12px] text-base',
        icon: 'h-10 w-10 rounded-[12px]',
        pill: 'h-9 px-4 rounded-full text-xs',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
