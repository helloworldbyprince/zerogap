'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { Search, UploadCloud, ShieldAlert, ArrowRight } from 'lucide-react';

export default function PurchasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
          {COPY.en.landing.featureCards[1].title}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Upload purchase bills + GSTR-2B file → identify blocked tax credit before filing GSTR-3B.
        </p>
      </div>

      {/* Two Dropzones (§9.4 wireframe Screen 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="rounded-[16px] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center hover:border-[var(--color-border)]/80 transition-colors cursor-pointer">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] flex items-center justify-center mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm text-[var(--color-text)]">1. Purchase Bills</h3>
          <p className="text-xs text-[var(--color-muted)] mt-1">Drop purchase invoices (PDF / photo)</p>
        </Card>

        <Card className="rounded-[16px] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center hover:border-[var(--color-border)]/80 transition-colors cursor-pointer">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] flex items-center justify-center mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm text-[var(--color-text)]">2. GSTR-2B File</h3>
          <p className="text-xs text-[var(--color-muted)] mt-1">Drop downloaded GST portal Excel / CSV</p>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="default" className="shadow-sm font-bold">
          Run Reconcile Match
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
