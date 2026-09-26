import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-[#F5A524] text-[#0A0C10] hover:bg-[#e0941d] shadow-sm',
        amber:
          'bg-[#F5A524] text-[#0A0C10] hover:bg-[#e0941d] shadow-sm',
        secondary:
          'bg-[#1A2029] text-[#ECEDEE] border border-[#232B36] hover:bg-[#232B36] hover:text-white',
        ghost:
          'bg-transparent text-[#9BA1A6] hover:bg-[#1A2029] hover:text-[#ECEDEE]',
        outline:
          'border border-[#232B36] bg-transparent text-[#ECEDEE] hover:bg-[#1A2029]',
        danger:
          'bg-[#F31260]/10 text-[#F31260] border border-[#F31260]/30 hover:bg-[#F31260]/20',
        success:
          'bg-[#17C964]/10 text-[#17C964] border border-[#17C964]/30 hover:bg-[#17C964]/20',
      },
      size: {
        default: 'h-10 px-5 py-2.5 rounded-[12px]',
        sm: 'h-8 px-3.5 py-1.5 rounded-[10px] text-xs',
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
