'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { ChevronRight, Info, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function DashboardMockCard() {
  const [showDetails, setShowDetails] = useState(false);
  const copy = COPY.en.landing.mockCard;

  return (
    <div className="relative group w-full max-w-md mx-auto lg:max-w-none">
      {/* Ambient background wash */}
      <div className="absolute -inset-1 rounded-[20px] bg-gradient-to-r from-[#F31260]/10 via-[#F5A524]/10 to-[#2563EB]/10 opacity-70 blur-xl group-hover:opacity-100 transition duration-500" />

      {/* Surface Card */}
      <div className="relative rounded-[16px] border border-[#E3E7EE] bg-white p-6 shadow-xl transition duration-300 hover:border-[#CBD2DE]">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#F31260] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C70E4E]">
              Rule 88D Risk Alert
            </span>
          </div>
          <span className="text-xs font-medium text-[#5F6B7A] bg-[#F0F2F5] px-2.5 py-1 rounded-full border border-[#E3E7EE]">
            {CONFIG.demo.periodLabel}
          </span>
        </div>

        {/* Hero Money Figure */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#5F6B7A] uppercase tracking-wide">
              {copy.title}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#9E6400] hover:underline flex items-center gap-1 cursor-pointer"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <span>{copy.whyPrompt}</span>
                    <Info className="h-3.5 w-3.5 text-[#F5A524]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-white border-[#E3E7EE] text-[#111418] p-3 text-xs leading-relaxed shadow-lg">
                  {copy.whyExplanation}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl sm:text-5xl font-semibold text-[#F31260] tabular-nums tracking-tight">
              {copy.amount}
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F31260]/10 text-[#C70E4E] border border-[#F31260]/20">
              14 Mismatches
            </span>
          </div>

          <p className="text-xs text-[#5F6B7A] pt-1">
            Supplier invoices missing from GSTR-2B. ITC blocked if filed today.
          </p>
        </div>

        {/* Mini Preview Rows */}
        <div className="mt-5 space-y-2.5 pt-4 border-t border-[#E3E7EE]">
          <div className="flex items-center justify-between text-xs bg-[#F6F7F9] p-3 rounded-[12px] border border-[#E3E7EE]">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-[#F31260]" />
              <div>
                <p className="font-medium text-[#111418]">Sharma Traders · INV-104</p>
                <p className="text-[11px] text-[#5F6B7A]">Supplier did not file GSTR-1</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#C70E4E] tabular-nums">₹10,440</p>
              <p className="text-[10px] text-[#5F6B7A]">blocked</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs bg-[#F6F7F9] p-3 rounded-[12px] border border-[#E3E7EE]">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-[#F5A524]" />
              <div>
                <p className="font-medium text-[#111418]">Apex Logistics · AP-982</p>
                <p className="text-[11px] text-[#5F6B7A]">Tax rate mismatch: 12% vs 18%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#9E6400] tabular-nums">₹3,200</p>
              <p className="text-[10px] text-[#5F6B7A]">rate check</p>
            </div>
          </div>
        </div>

        {/* Live CTA button into demo */}
        <div className="mt-5">
          <Link
            href="/onboarding?demo=1"
            className="flex items-center justify-between w-full p-3 rounded-[12px] bg-[#FDF6E4] hover:bg-[#faeed0] border border-[#F5A524]/30 text-xs font-medium text-[#9E6400] group/btn transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#F5A524]" />
              Resolve all 14 in live demo
            </span>
            <ChevronRight className="h-4 w-4 text-[#9E6400] group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
