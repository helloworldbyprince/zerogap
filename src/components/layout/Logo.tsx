import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ href = '/', className, size = 'md' }: LogoProps) {
  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-[8px] bg-[#F5A524] transition-transform duration-200 group-hover:scale-105 shadow-xs',
          size === 'sm' && 'h-6 w-6 rounded-[6px]',
          size === 'md' && 'h-8 w-8 rounded-[8px]',
          size === 'lg' && 'h-10 w-10 rounded-[10px]'
        )}
      >
        {/* Gap Mark: Zero / Ø stylized icon */}
        <span
          className={cn(
            'font-black text-[#1A1A1A] leading-none',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          ∅
        </span>
      </div>
      <span
        className={cn(
          'font-semibold tracking-tight text-[#111418] font-sans',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-2xl'
        )}
      >
        Zero<span className="text-[#F5A524]">Gap</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
