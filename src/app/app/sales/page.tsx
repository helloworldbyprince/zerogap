'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { ArrowRight, FileText, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function SalesPage() {
  return (
    <div className="space-y-8">
      {/* Stepper Header (§9.4 wireframe Screen 3) */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
            {COPY.en.landing.featureCards[0].title}
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Upload sales bills → AI extracts line items, validates HSN codes, and builds GSTR-1 JSON.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-[var(--color-amber)] text-[#0A0C10] font-bold">1. Upload</span>
          <span className="text-[var(--color-muted)]">→</span>
          <span className="px-3 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]">2. Review</span>
          <span className="text-[var(--color-muted)]">→</span>
          <span className="px-3 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]">3. GSTR-1 Export</span>
        </div>
      </div>

      {/* Step A - Dropzone Mock */}
      <Card className="rounded-[18px] border-2 border-dashed border-[var(--color-amber)]/50 bg-[var(--color-surface)]/60 p-12 text-center hover:border-[var(--color-amber)] transition-colors cursor-pointer">
        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-[var(--color-amber)]/10 text-[var(--color-amber)] flex items-center justify-center">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              Drop sales bills here (PDF / JPG / PNG)
            </h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              or browse from device · up to {CONFIG.uploads.maxFiles} files, {CONFIG.uploads.maxFileMB}MB each
            </p>
          </div>
          <Button variant="primary" size="default" className="shadow-sm">
            Browse Sales Files
          </Button>
        </div>
      </Card>

      {/* Summary Bar preview */}
      <div className="p-4 rounded-[12px] bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between text-xs font-semibold text-[var(--color-muted)]">
        <span>{CONFIG.demo.salesBillsReady} demo bills processed</span>
        <span>Taxable: ₹8,42,000</span>
        <span>Tax: ₹1,51,560</span>
        <span className="text-[var(--color-emerald)]">B2B: 18 · B2CL: 1 · B2CS: 5</span>
        <span className="text-[var(--color-amber)]">3 advisory flags</span>
      </div>
    </div>
  );
}
