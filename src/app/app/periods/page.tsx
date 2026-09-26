'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { Calendar } from 'lucide-react';

export default function PeriodsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
          {COPY.en.landing.featureCards[3].title}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Historical multi-month rollups powered by BigQuery. Feeds into your annual GSTR-9 filing.
        </p>
      </div>

      <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <Calendar className="h-10 w-10 text-[var(--color-amber)] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[var(--color-text)]">Multi-Period Rollups</h3>
        <p className="text-xs text-[var(--color-muted)] max-w-md mx-auto mt-1">
          Monthly, quarterly, and yearly financial views will render here upon completion of Phase 7.
        </p>
      </Card>
    </div>
  );
}
