'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { formatRupees } from '@/lib/utils';
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TrianglePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
          {COPY.en.landing.featureCards[2].title}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Three numbers. Zero surprises. Compare GSTR-1, GSTR-2B, and GSTR-3B tax figures before payment.
        </p>
      </div>

      {/* Three Giant Numbers (§9.4 wireframe Screen 5) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
            1. GSTR-1 Tax Liability
          </span>
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tabular-nums mt-2">
            {formatRupees(CONFIG.demo.salesTax)}
          </h2>
          <span className="inline-block mt-2 text-xs font-semibold text-[var(--color-emerald)]">
            Auto from Sales ✓
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
            2. GSTR-2B Credit Available
          </span>
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tabular-nums mt-2">
            {formatRupees(CONFIG.demo.itcAvailable2B)}
          </h2>
          <span className="inline-block mt-2 text-xs font-semibold text-[var(--color-emerald)]">
            Auto from 2B Upload ✓
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
            3. GSTR-3B Tax Paid & Claimed
          </span>
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tabular-nums mt-2">
            {formatRupees(CONFIG.demo.taxPaid3B)}
          </h2>
          <span className="inline-block mt-2 text-xs font-semibold text-[var(--color-amber)]">
            ITC Claimed: {formatRupees(CONFIG.demo.itcClaimed3B)}
          </span>
        </Card>
      </div>

      {/* Check Rows */}
      <div className="space-y-4">
        <div className="p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-emerald)]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[var(--color-emerald)]" />
            <div>
              <p className="text-sm font-bold text-[var(--color-text)]">Sales Check: GSTR-1 vs 3B Tax Paid</p>
              <p className="text-xs text-[var(--color-muted)]">Rule 88C DRC-01B audit: 100% matched.</p>
            </div>
          </div>
          <span className="text-sm font-bold text-[var(--color-emerald)]">Gap: ₹0 ✓</span>
        </div>

        <div className="p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-red)]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--color-red)]" />
            <div>
              <p className="text-sm font-bold text-[var(--color-text)]">Credit Check: 2B Available vs 3B Claimed</p>
              <p className="text-xs text-[var(--color-muted)]">Rule 88D DRC-01C: ₹2,300 excess claim review required.</p>
            </div>
          </div>
          <span className="text-sm font-bold text-[var(--color-red)]">Gap: ₹2,300</span>
        </div>
      </div>

      {/* Disclaimer (§9.3 & §9.4 wireframe Screen 5) */}
      <div className="p-4 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-muted)] italic text-center">
        {COPY.en.common.triangleDisclaimer}
      </div>
    </div>
  );
}
