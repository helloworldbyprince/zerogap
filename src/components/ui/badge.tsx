import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#1A2029] text-[#ECEDEE] border border-[#232B36]',
        emerald: 'bg-[#17C964]/15 text-[#17C964] border border-[#17C964]/30',
        amber: 'bg-[#F5A524]/15 text-[#F5A524] border border-[#F5A524]/30',
        red: 'bg-[#F31260]/15 text-[#F31260] border border-[#F31260]/30',
        blue: 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30',
        neutral: 'bg-[#1A2029] text-[#9BA1A6] border border-[#232B36]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'emerald' && 'bg-[#17C964]',
            variant === 'amber' && 'bg-[#F5A524]',
            variant === 'red' && 'bg-[#F31260]',
            variant === 'blue' && 'bg-[#3B82F6]',
            (!variant || variant === 'default' || variant === 'neutral') &&
              'bg-[#9BA1A6]'
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
