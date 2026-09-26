'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, FileSpreadsheet, ShieldAlert, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function DashboardMockCard() {
  const [showDetails, setShowDetails] = useState(false);
  const copy = COPY.en.landing.mockCard;

  return (
    <div className="relative group w-full max-w-md mx-auto lg:max-w-none">
      {/* Ambient background glow */}
      <div className="absolute -inset-1 rounded-[20px] bg-gradient-to-r from-[#F31260]/20 via-[#F5A524]/20 to-[#3B82F6]/20 opacity-70 blur-xl group-hover:opacity-100 transition duration-500" />

      {/* Surface Card */}
      <div className="relative rounded-[16px] border border-[#232B36] bg-[#12161D] p-6 shadow-2xl transition duration-300 hover:border-[#3B4856]">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-[#232B36] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#F31260] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F31260]">
              Rule 88D Risk Alert
            </span>
          </div>
          <span className="text-xs font-medium text-[#9BA1A6] bg-[#1A2029] px-2.5 py-1 rounded-full border border-[#232B36]">
            {CONFIG.demo.periodLabel}
          </span>
        </div>

        {/* Hero Money Figure */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#9BA1A6] uppercase tracking-wide">
              {copy.title}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#F5A524] hover:underline flex items-center gap-1 cursor-pointer"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {copy.whyPrompt}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A2029] border-[#232B36] text-[#ECEDEE] p-3 text-xs leading-relaxed">
                  {copy.whyExplanation}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F31260] tabular-nums tracking-tight">
              {copy.amount}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F31260]/15 text-[#F31260] border border-[#F31260]/30">
              14 Mismatches
            </span>
          </div>

          <p className="text-xs text-[#9BA1A6] pt-1">
            Supplier invoices missing from GSTR-2B. ITC blocked if filed today.
          </p>
        </div>

        {/* Mini Preview Rows */}
        <div className="mt-5 space-y-2.5 pt-4 border-t border-[#232B36]">
          <div className="flex items-center justify-between text-xs bg-[#1A2029] p-3 rounded-[12px] border border-[#232B36]/80">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-[#F31260]" />
              <div>
                <p className="font-semibold text-[#ECEDEE]">Sharma Traders · INV-104</p>
                <p className="text-[11px] text-[#9BA1A6]">Supplier did not file GSTR-1</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#F31260] tabular-nums">₹10,440</p>
              <p className="text-[10px] text-[#9BA1A6]">blocked</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs bg-[#1A2029] p-3 rounded-[12px] border border-[#232B36]/80">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-[#F5A524]" />
              <div>
                <p className="font-semibold text-[#ECEDEE]">Apex Logistics · AP-982</p>
                <p className="text-[11px] text-[#9BA1A6]">Tax rate mismatch: 12% vs 18%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#F5A524] tabular-nums">₹3,200</p>
              <p className="text-[10px] text-[#9BA1A6]">rate check</p>
            </div>
          </div>
        </div>

        {/* Live CTA button into demo */}
        <div className="mt-5">
          <Link
            href="/onboarding?demo=1"
            className="flex items-center justify-between w-full p-3 rounded-[12px] bg-[#1A2029] hover:bg-[#232B36] border border-[#232B36] text-xs font-semibold text-[#ECEDEE] group/btn transition-colors"
          >
            <span className="flex items-center gap-2 text-[#F5A524]">
              <Sparkles className="h-4 w-4" />
              Resolve all 14 in live demo
            </span>
            <ChevronRight className="h-4 w-4 text-[#9BA1A6] group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
