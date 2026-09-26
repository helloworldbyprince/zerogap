'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { BarChart3, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
            Reconciliation Reports
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Print-ready summary PDF and client WhatsApp updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
          >
            <Download className="h-4 w-4 mr-1.5" />
            {COPY.en.common.downloadPdf}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(
                `ZeroGap Summary: ${CONFIG.demo.businessName} (${CONFIG.demo.periodLabel}) - Match Score: ${CONFIG.demo.matchScore}%, Money at risk: ₹1,84,200 across 14 mismatches.`
              );
              toast.success('Summary copied for WhatsApp!');
            }}
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            {COPY.en.common.copyForWhatsApp}
          </Button>
        </div>
      </div>

      <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 space-y-4">
        <h3 className="text-lg font-bold text-[var(--color-text)]">
          Monthly Reconciliation Summary · {CONFIG.demo.periodLabel}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-[10px] bg-[var(--color-surface-2)]">
            <span className="text-[var(--color-muted)] block">Tax Credit at Risk</span>
            <span className="text-lg font-bold text-[var(--color-red)]">₹1,84,200</span>
          </div>
          <div className="p-3 rounded-[10px] bg-[var(--color-surface-2)]">
            <span className="text-[var(--color-muted)] block">Match Score</span>
            <span className="text-lg font-bold text-[var(--color-amber)]">94%</span>
          </div>
          <div className="p-3 rounded-[10px] bg-[var(--color-surface-2)]">
            <span className="text-[var(--color-muted)] block">GSTR-1 Liability</span>
            <span className="text-lg font-bold text-[var(--color-text)]">₹1,51,560</span>
          </div>
          <div className="p-3 rounded-[10px] bg-[var(--color-surface-2)]">
            <span className="text-[var(--color-muted)] block">Rule 88D Status</span>
            <span className="text-lg font-bold text-[var(--color-amber)]">Action Needed</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
