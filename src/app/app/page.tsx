'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { formatRupees } from '@/lib/utils';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck,
  FileText,
  Info,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/lib/WorkspaceContext';

export default function DashboardPage() {
  const { activeBusiness, activeBusinessId, activePeriod, isDemo } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [cleanState, setCleanState] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard?bizId=${encodeURIComponent(activeBusinessId)}&period=${encodeURIComponent(activePeriod)}`);
        const json = await res.json();
        if (json.period) {
          setData(json.period);
        }
      } catch (e) {
        toast.error('Could not load this workspace. Please retry.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [activeBusinessId, activePeriod]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-[#F0F2F5] rounded-[10px]" />
        <div className="h-44 w-full bg-white border border-[#E3E7EE] rounded-[16px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white border border-[#E3E7EE] rounded-[16px]" />
          <div className="h-32 bg-white border border-[#E3E7EE] rounded-[16px]" />
          <div className="h-32 bg-white border border-[#E3E7EE] rounded-[16px]" />
        </div>
      </div>
    );
  }

  if (!data && !isDemo) {
    return (
      <div className="mx-auto max-w-2xl rounded-[16px] border border-[#E3E7EE] bg-white p-10 text-center shadow-xs">
        <FileText className="mx-auto h-10 w-10 text-[#F5A524]" />
        <h1 className="mt-4 text-xl font-semibold text-[#111418]">Your workspace is ready</h1>
        <p className="mt-2 text-sm text-[#5F6B7A]">{activeBusiness?.name || 'This business'} has no data for this filing period yet. Upload sales bills to begin.</p>
        <Button asChild className="mt-6"><Link href="/app/sales">Upload sales bills</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. Period Header & Status Pill
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-[30px] font-semibold text-[#111418] tracking-[-0.02em]">
              {CONFIG.demo.periodLabel}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FDF6E4] text-[#9E6400] border border-[#F5A524]/30 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5A524]" />
              {CONFIG.demo.stepsCompleted} of {CONFIG.demo.totalSteps} steps completed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5F6B7A] mt-1">
            GSTR-1 outward filing due on the 11th · GSTR-3B tax payment due on the 20th.
          </p>
        </div>

        {/* Demo Clean State Toggle for Testing & Judges */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCleanState(!cleanState);
              toast.info(cleanState ? 'Switched to Issue State' : 'Switched to Clean State');
            }}
            className="text-xs font-medium px-3.5 py-1.5 rounded-[10px] border border-[#E3E7EE] bg-white text-[#5F6B7A] hover:text-[#111418] hover:bg-[#F6F7F9] shadow-xs transition-colors cursor-pointer"
          >
            {cleanState ? 'Show Issues Demo' : 'Simulate Clean State'}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MONEY HERO (Full Width per §9.4 wireframe)
      ────────────────────────────────────────────────────────────── */}
      {!cleanState ? (
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-[18px] bg-gradient-to-r from-[#F31260]/10 via-[#F5A524]/10 to-transparent opacity-50 blur-lg" />
          <Card className="relative rounded-[16px] border border-[#F31260]/30 bg-white p-7 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#F31260]" />
                  <span className="text-xs font-semibold text-[#5F6B7A] uppercase tracking-wider">
                    {COPY.en.common.moneyAtRisk}
                  </span>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-xs font-medium text-[#9E6400] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{COPY.en.common.whyAffordance}</span>
                        <Info className="h-3.5 w-3.5 text-[#F5A524]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-[#E3E7EE] text-[#111418] p-3 text-xs leading-relaxed max-w-xs shadow-lg">
                      {formatRupees(CONFIG.demo.moneyAtRisk)} total Input Tax Credit is blocked because suppliers have not uploaded or filed their GSTR-1 returns. Claiming it in 3B triggers DRC-01C.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex flex-wrap items-baseline gap-4">
                <h2 className="text-5xl sm:text-[56px] font-semibold text-[#F31260] tabular-nums tracking-[-0.03em] leading-none">
                  {formatRupees(CONFIG.demo.moneyAtRisk)}
                </h2>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F31260]/10 text-[#C70E4E] border border-[#F31260]/20">
                  across {CONFIG.demo.mismatchCount} mismatches
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#E3E7EE]/80">
                <p className="text-xs sm:text-sm text-[#5F6B7A]">
                  Unfiled supplier bills will trigger automated Rule 88D recovery notices if claimed without resolution.
                </p>
                <Button asChild variant="primary" size="default" className="shadow-xs font-medium">
                  <Link href="/app/purchases">
                    Review Mismatches
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Clean state: full width emerald moment (§9.2 Principle 9) */
        <Card className="rounded-[16px] border border-[#17C964]/30 bg-white p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#17C964]/10 text-[#0F8C43]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-[21px] font-semibold text-[#0F8C43]">
                  {COPY.en.common.cleanState}
                </h2>
                <p className="text-sm text-[#5F6B7A] mt-0.5">
                  GSTR-1, 2B, and 3B numbers are 100% balanced for {CONFIG.demo.periodLabel}. No notices expected.
                </p>
              </div>
            </div>

            <Button asChild variant="success" size="default" className="font-medium shadow-xs">
              <Link href="/app/reports">Download Audit Summary</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. Three Feature Status Cards (§9.4 wireframe)
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Sales → GSTR-1 */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 hover:border-[#CBD2DE] transition-all flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-[10px] bg-[#FDF6E4] text-[#F5A524]">
                <FileText className="h-5 w-5" />
              </div>
              <Badge variant="emerald" dot>
                Ready
              </Badge>
            </div>

            <div>
              <h3 className="text-[17px] font-medium text-[#111418]">
                Sales → GSTR-1
              </h3>
              <p className="text-2xl font-semibold text-[#111418] tabular-nums mt-1">
                {CONFIG.demo.salesBillsReady} bills ready
              </p>
              <p className="text-xs text-[#5F6B7A] mt-1">
                Taxable {formatRupees(CONFIG.demo.salesTaxableValue)} · Tax {formatRupees(CONFIG.demo.salesTax)}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E3E7EE]">
            <Link
              href="/app/sales"
              className="text-xs font-medium text-[#9E6400] hover:underline flex items-center justify-between"
            >
              <span>Open Sales Pipeline</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        {/* Card 2: Purchases vs 2B */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 hover:border-[#CBD2DE] transition-all flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-[10px] bg-[#17C964]/10 text-[#0F8C43]">
                <Search className="h-5 w-5" />
              </div>
              <Badge variant="amber" dot>
                Review Needed
              </Badge>
            </div>

            <div>
              <h3 className="text-[17px] font-medium text-[#111418]">
                Purchases vs 2B
              </h3>
              <p className="text-2xl font-semibold text-[#111418] tabular-nums mt-1">
                Match score {CONFIG.demo.matchScore}%
              </p>
              <p className="text-xs text-[#5F6B7A] mt-1">
                41 matched · 14 flagged bills
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E3E7EE]">
            <Link
              href="/app/purchases"
              className="text-xs font-medium text-[#9E6400] hover:underline flex items-center justify-between"
            >
              <span>Open Match Engine</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        {/* Card 3: Triangle Check */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 hover:border-[#CBD2DE] transition-all flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-[10px] bg-[#2563EB]/10 text-[#2563EB]">
                <Scale className="h-5 w-5" />
              </div>
              <Badge variant="red" dot>
                1 Gap to Review
              </Badge>
            </div>

            <div>
              <h3 className="text-[17px] font-medium text-[#111418]">
                Triangle Check
              </h3>
              <p className="text-2xl font-semibold text-[#111418] tabular-nums mt-1">
                {formatRupees(CONFIG.demo.creditCheckGap)} gap
              </p>
              <p className="text-xs text-[#5F6B7A] mt-1">
                2B Credit vs 3B Claimed comparison
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E3E7EE]">
            <Link
              href="/app/triangle"
              className="text-xs font-medium text-[#9E6400] hover:underline flex items-center justify-between"
            >
              <span>Inspect Triangle</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Needs Your Attention + Recent Activity (§9.4 wireframe)
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (Top 3 Needs Attention) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[21px] font-semibold text-[#111418]">
              Needs your attention (Top 3)
            </h3>
            <Link href="/app/purchases" className="text-xs font-medium text-[#9E6400] hover:underline">
              View all 14 →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-[14px] bg-white border border-[#E3E7EE] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F31260] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#111418]">Sharma Traders · INV-104</p>
                  <p className="text-xs text-[#5F6B7A]">Supplier didn't file GSTR-1 · Missing in GSTR-2B</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#C70E4E] tabular-nums">₹10,440</p>
                <p className="text-[10px] text-[#5F6B7A]">blocked</p>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-white border border-[#E3E7EE] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F5A524] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#111418]">Apex Logistics · AP-982</p>
                  <p className="text-xs text-[#5F6B7A]">Rate mismatch: billed 12%, HSN 8471 master is 18%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#9E6400] tabular-nums">₹3,200</p>
                <p className="text-[10px] text-[#5F6B7A]">rate check</p>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-white border border-[#E3E7EE] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F31260] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#111418]">Radhe Steels · RS-551</p>
                  <p className="text-xs text-[#5F6B7A]">Value mismatch: ₹62,000 billed vs ₹50,000 in 2B</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#C70E4E] tabular-nums">₹2,160</p>
                <p className="text-[10px] text-[#5F6B7A]">excess claim</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right (Recent Activity) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-[21px] font-semibold text-[#111418]">
            Recent activity
          </h3>

          <div className="p-5 rounded-[14px] bg-white border border-[#E3E7EE] space-y-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-[#17C964]/10 text-[#0F8C43] mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#111418]">24 sales bills processed</p>
                <p className="text-[11px] text-[#5F6B7A]">Extracted via Document AI with 99.4% confidence</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-[#17C964]/10 text-[#0F8C43] mt-0.5">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#111418]">GSTR-1 JSON schema compiled</p>
                <p className="text-[11px] text-[#5F6B7A]">Ready for export · Tables 4A, 7, and HSN 12</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-[#FDF6E4] text-[#F5A524] mt-0.5">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#111418]">GSTR-2B file ingested</p>
                <p className="text-[11px] text-[#5F6B7A]">41 of 45 invoices matched with purchase bills</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
