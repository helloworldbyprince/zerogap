import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#F0F2F5] text-[#5F6B7A] border border-[#E3E7EE]',
        emerald: 'bg-[#17C964]/10 text-[#0F8C43] border border-[#17C964]/25',
        amber: 'bg-[#F5A524]/15 text-[#9E6400] border border-[#F5A524]/30',
        red: 'bg-[#F31260]/10 text-[#C70E4E] border border-[#F31260]/25',
        blue: 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/25',
        neutral: 'bg-[#F0F2F5] text-[#5F6B7A] border border-[#E3E7EE]',
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
            'h-1.5 w-1.5 rounded-full shrink-0',
            variant === 'emerald' && 'bg-[#17C964]',
            variant === 'amber' && 'bg-[#F5A524]',
            variant === 'red' && 'bg-[#F31260]',
            variant === 'blue' && 'bg-[#2563EB]',
            (!variant || variant === 'default' || variant === 'neutral') &&
              'bg-[#5F6B7A]'
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
