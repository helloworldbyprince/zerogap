'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { formatRupees } from '@/lib/utils';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [cleanState, setCleanState] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (json.period) {
          setData(json.period);
        }
      } catch (e) {
        toast.error('Could not load period data, using cached demo data.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-[var(--color-surface-2)] rounded-[10px]" />
        <div className="h-44 w-full bg-[var(--color-surface-2)] rounded-[16px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-[var(--color-surface-2)] rounded-[16px]" />
          <div className="h-32 bg-[var(--color-surface-2)] rounded-[16px]" />
          <div className="h-32 bg-[var(--color-surface-2)] rounded-[16px]" />
        </div>
      </div>
    );
  }

  const periodData = data || {
    totals: {
      salesTxval: CONFIG.demo.salesTaxableValue,
      salesTax: CONFIG.demo.salesTax,
      itcAvailable2B: CONFIG.demo.itcAvailable2B,
      itcClaimed: CONFIG.demo.itcClaimed3B,
    },
    moneyAtRisk: CONFIG.demo.moneyAtRisk,
    matchScore: CONFIG.demo.matchScore,
  };

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. Period Header & Status Pill
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              {CONFIG.demo.periodLabel}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-amber)]/15 text-[var(--color-amber)] border border-[var(--color-amber)]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-amber)] animate-pulse" />
              {CONFIG.demo.stepsCompleted} of {CONFIG.demo.totalSteps} steps completed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1">
            GSTR-1 outward filing due on the 11th · GSTR-3B tax payment due on the 20th.
          </p>
        </div>

        {/* Demo Clean State Toggle for Testing & Judges */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCleanState(!cleanState);
              toast.info(cleanState ? 'Switched to Issue State' : 'Switched to Clean State ✓');
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            {cleanState ? 'Show Issues Demo' : 'Simulate Clean State ✓'}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MONEY HERO (Full Width per §9.4 wireframe)
      ────────────────────────────────────────────────────────────── */}
      {!cleanState ? (
        <Card className="rounded-[18px] border border-[var(--color-red)]/40 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-red)]/5 p-7 shadow-xl relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[var(--color-red)]" />
                <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                  {COPY.en.common.moneyAtRisk}
                </span>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-xs font-bold text-[var(--color-amber)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {COPY.en.common.whyAffordance}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] p-3 text-xs leading-relaxed max-w-xs shadow-lg">
                    {formatRupees(CONFIG.demo.moneyAtRisk)} total Input Tax Credit is blocked because suppliers have not uploaded or filed their GSTR-1 returns. Claiming it in 3B triggers DRC-01C.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-wrap items-baseline gap-4">
              <h2 className="text-5xl sm:text-6xl font-extrabold text-[var(--color-red)] tabular-nums tracking-tight">
                {formatRupees(CONFIG.demo.moneyAtRisk)}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--color-red)]/15 text-[var(--color-red)] border border-[var(--color-red)]/30">
                across {CONFIG.demo.mismatchCount} mismatches
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-[var(--color-muted)]">
                Unfiled supplier bills will trigger automated Rule 88D recovery notices if claimed without resolution.
              </p>
              <Button asChild variant="primary" size="sm" className="h-9 px-4 font-bold shadow-sm">
                <Link href="/app/purchases">
                  Review Mismatches
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Clean state: full width emerald moment (§9.2 Principle 9) */
        <Card className="rounded-[18px] border border-[var(--color-emerald)]/40 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-emerald)]/10 p-7 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[var(--color-emerald)]/20 text-[var(--color-emerald)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--color-emerald)]">
                  {COPY.en.common.cleanState}
                </h2>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">
                  GSTR-1, 2B, and 3B numbers are 100% balanced for {CONFIG.demo.periodLabel}. No notices expected.
                </p>
              </div>
            </div>

            <Button asChild variant="success" size="default">
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
        <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-border)]/80 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-[10px] bg-[var(--color-amber)]/10 text-[var(--color-amber)]">
                <FileText className="h-5 w-5" />
              </div>
              <Badge variant="emerald" dot>
                Ready
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Sales → GSTR-1
              </h3>
              <p className="text-2xl font-extrabold text-[var(--color-text)] tabular-nums mt-1">
                {CONFIG.demo.salesBillsReady} bills ready
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Taxable {formatRupees(CONFIG.demo.salesTaxableValue)} · Tax {formatRupees(CONFIG.demo.salesTax)}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <Link
              href="/app/sales"
              className="text-xs font-bold text-[var(--color-amber)] hover:underline flex items-center justify-between"
            >
              <span>Open Sales Pipeline</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        {/* Card 2: Purchases vs 2B */}
        <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-border)]/80 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-[10px] bg-[var(--color-emerald)]/10 text-[var(--color-emerald)]">
                <Search className="h-5 w-5" />
              </div>
              <Badge variant="amber" dot>
                Review Needed
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Purchases vs 2B
              </h3>
              <p className="text-2xl font-extrabold text-[var(--color-text)] tabular-nums mt-1">
                Match score {CONFIG.demo.matchScore}%
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                41 matched · 14 flagged bills
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <Link
              href="/app/purchases"
              className="text-xs font-bold text-[var(--color-amber)] hover:underline flex items-center justify-between"
            >
              <span>Open Match Engine</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        {/* Card 3: Triangle Check */}
        <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-border)]/80 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-[10px] bg-[var(--color-blue)]/10 text-[var(--color-blue)]">
                <Scale className="h-5 w-5" />
              </div>
              <Badge variant="red" dot>
                1 Gap to Review
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Triangle Check
              </h3>
              <p className="text-2xl font-extrabold text-[var(--color-text)] tabular-nums mt-1">
                {formatRupees(CONFIG.demo.creditCheckGap)} gap
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                2B Credit vs 3B Claimed comparison
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <Link
              href="/app/triangle"
              className="text-xs font-bold text-[var(--color-amber)] hover:underline flex items-center justify-between"
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
            <h3 className="text-base font-bold text-[var(--color-text)]">
              Needs your attention (Top 3)
            </h3>
            <Link href="/app/purchases" className="text-xs font-bold text-[var(--color-amber)] hover:underline">
              View all 14 →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-red)] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">Sharma Traders · INV-104</p>
                  <p className="text-xs text-[var(--color-muted)]">Supplier didn't file GSTR-1 · Missing in GSTR-2B</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--color-red)] tabular-nums">₹10,440</p>
                <p className="text-[10px] text-[var(--color-muted)]">blocked</p>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-amber)] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">Apex Logistics · AP-982</p>
                  <p className="text-xs text-[var(--color-muted)]">Rate mismatch: billed 12%, HSN 8471 master is 18%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--color-amber)] tabular-nums">₹3,200</p>
                <p className="text-[10px] text-[var(--color-muted)]">rate check</p>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-red)] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">Radhe Steels · RS-551</p>
                  <p className="text-xs text-[var(--color-muted)]">Value mismatch: ₹62,000 billed vs ₹50,000 in 2B</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--color-red)] tabular-nums">₹2,160</p>
                <p className="text-[10px] text-[var(--color-muted)]">excess claim</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right (Recent Activity) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-[var(--color-text)]">
            Recent activity
          </h3>

          <div className="p-5 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-[var(--color-emerald)]/10 text-[var(--color-emerald)] mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">24 sales bills processed</p>
                <p className="text-[11px] text-[var(--color-muted)]">Extracted via Document AI with 99.4% confidence</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-[var(--color-emerald)]/10 text-[var(--color-emerald)] mt-0.5">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">GSTR-1 JSON schema compiled</p>
                <p className="text-[11px] text-[var(--color-muted)]">Ready for export · Tables 4A, 7, and HSN 12</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-[var(--color-amber)]/10 text-[var(--color-amber)] mt-0.5">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">GSTR-2B file ingested</p>
                <p className="text-[11px] text-[var(--color-muted)]">41 of 45 invoices matched with purchase bills</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
