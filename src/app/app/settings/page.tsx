'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/lib/config';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [bizName, setBizName] = useState<string>(CONFIG.demo.businessName);
  const [gstin, setGstin] = useState('06ABCDE1234F1Z5');
  const [turnoverSlab, setTurnoverSlab] = useState<'UNDER_5CR' | 'OVER_5CR'>('UNDER_5CR');

  const handleSave = () => {
    toast.success('Business settings saved!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Manage your business profile, GSTIN configuration, and turnover thresholds.
        </p>
      </div>

      <Card className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text)]">Business Profile</h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[var(--color-text)] mb-1">Business Name</label>
            <input
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text)] mb-1">GSTIN</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-mono text-[var(--color-text)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text)] mb-1">Turnover Threshold (HSN Digit Rules)</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTurnoverSlab('UNDER_5CR')}
                className={`flex-1 py-2 px-3 rounded-[8px] border text-xs font-semibold ${
                  turnoverSlab === 'UNDER_5CR'
                    ? 'border-[var(--color-amber)] text-[var(--color-amber)] bg-[var(--color-amber)]/10'
                    : 'border-[var(--color-border)] text-[var(--color-muted)]'
                }`}
              >
                Under ₹5 cr (min 4 HSN digits)
              </button>
              <button
                type="button"
                onClick={() => setTurnoverSlab('OVER_5CR')}
                className={`flex-1 py-2 px-3 rounded-[8px] border text-xs font-semibold ${
                  turnoverSlab === 'OVER_5CR'
                    ? 'border-[var(--color-amber)] text-[var(--color-amber)] bg-[var(--color-amber)]/10'
                    : 'border-[var(--color-border)] text-[var(--color-muted)]'
                }`}
              >
                Over ₹5 cr (min 6 HSN digits)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
