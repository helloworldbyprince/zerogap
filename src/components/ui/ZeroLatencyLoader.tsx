'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TopProgressBar({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-[#E3E7EE]/40 overflow-hidden pointer-events-none"
    >
      <div className="h-full w-full bg-gradient-to-r from-[#F5A524] via-[#17C964] to-[#F5A524] shadow-[0_0_8px_rgba(245,165,36,0.8)] animate-zero-progress origin-left" />
    </div>
  );
}

export function CuteLoader({
  size = 'md',
  text,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 text-xs font-medium text-[#5F6B7A]', className)}>
      <Loader2 className={cn('animate-spin text-[#F5A524]', sizeClasses[size])} />
      {text && <span>{text}</span>}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans animate-in fade-in-0 duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-44 bg-[#E3E7EE]/70 rounded-[10px] animate-pulse" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FDF6E4] text-[#9E6400] border border-[#F5A524]/30 shadow-xs">
            <Loader2 className="h-3 w-3 animate-spin text-[#F5A524]" />
            <span>Loading workspace…</span>
          </div>
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="relative overflow-hidden rounded-[16px] border border-[#E3E7EE] bg-white p-6 shadow-xs">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-[#E3E7EE]/70 rounded-md animate-pulse" />
          <div className="h-8 w-72 bg-[#E3E7EE]/80 rounded-md animate-pulse" />
          <div className="h-3.5 w-full max-w-md bg-[#E3E7EE]/50 rounded-md animate-pulse" />
        </div>
        <div className="mt-6 pt-4 border-t border-[#E3E7EE] flex items-center justify-between">
          <div className="h-3.5 w-36 bg-[#E3E7EE]/50 rounded-md animate-pulse" />
          <div className="h-8 w-28 bg-[#E3E7EE]/70 rounded-[10px] animate-pulse" />
        </div>
      </div>

      {/* 3 Metric Cards Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-[#E3E7EE]/70 rounded-md animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-[#E3E7EE] animate-pulse" />
            </div>
            <div className="h-7 w-28 bg-[#E3E7EE]/80 rounded-md animate-pulse" />
            <div className="h-3 w-40 bg-[#E3E7EE]/50 rounded-md animate-pulse" />
            <div className="pt-2 border-t border-[#E3E7EE]/60 flex items-center justify-between">
              <div className="h-3 w-20 bg-[#E3E7EE]/50 rounded-md animate-pulse" />
              <div className="h-3 w-16 bg-[#E3E7EE]/50 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TriangleSkeleton() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans animate-in fade-in-0 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-[#E3E7EE]/70 rounded animate-pulse" />
          <div className="h-7 w-64 bg-[#E3E7EE]/80 rounded animate-pulse" />
          <div className="h-3.5 w-80 bg-[#E3E7EE]/50 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 bg-[#E3E7EE]/60 rounded-[10px] animate-pulse" />
          <div className="h-8 w-28 bg-[#E3E7EE]/60 rounded-[10px] animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-28 bg-[#E3E7EE]/70 rounded animate-pulse" />
              <div className="h-4 w-12 bg-[#E3E7EE]/50 rounded animate-pulse" />
            </div>
            <div className="h-8 w-36 bg-[#E3E7EE]/80 rounded animate-pulse" />
            <div className="pt-3 border-t border-[#E3E7EE] flex justify-between">
              <div className="h-3 w-24 bg-[#E3E7EE]/50 rounded animate-pulse" />
              <div className="h-3 w-12 bg-[#E3E7EE]/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((idx) => (
          <div key={idx} className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 shadow-xs space-y-4">
            <div className="h-5 w-48 bg-[#E3E7EE]/70 rounded animate-pulse" />
            <div className="h-16 w-full bg-[#E3E7EE]/40 rounded-xl animate-pulse" />
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-full bg-[#E3E7EE]/40 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-[#E3E7EE]/40 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans animate-in fade-in-0 duration-200 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-[#E3E7EE]/70 rounded animate-pulse" />
          <div className="h-7 w-64 bg-[#E3E7EE]/80 rounded animate-pulse" />
          <div className="h-3.5 w-72 bg-[#E3E7EE]/50 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 bg-[#E3E7EE]/60 rounded-[10px] animate-pulse" />
          <div className="h-8 w-32 bg-[#E3E7EE]/60 rounded-[10px] animate-pulse" />
        </div>
      </div>

      <div className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-2 border-b border-[#E3E7EE] pb-4">
          <div className="h-6 w-80 bg-[#E3E7EE]/70 rounded animate-pulse" />
          <div className="h-3.5 w-96 bg-[#E3E7EE]/50 rounded animate-pulse" />
        </div>
        <div className="h-12 w-full bg-[#E3E7EE]/40 rounded-xl animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 w-40 bg-[#E3E7EE]/60 rounded animate-pulse" />
          <div className="h-14 w-full bg-[#E3E7EE]/40 rounded-xl animate-pulse" />
        </div>
        <div className="h-36 w-full bg-[#E3E7EE]/30 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="py-3 px-3">
              <div className="h-3.5 bg-[#E3E7EE]/70 rounded w-full max-w-[90px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
