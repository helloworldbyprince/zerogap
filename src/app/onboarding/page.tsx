'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CONFIG } from '@/lib/config';
import { ArrowRight, CheckCircle2, ChevronLeft, HelpCircle, Sparkles, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

const INDIAN_STATES = [
  { code: '06', name: '06 - Haryana' },
  { code: '07', name: '07 - Delhi' },
  { code: '08', name: '08 - Rajasthan' },
  { code: '09', name: '09 - Uttar Pradesh' },
  { code: '24', name: '24 - Gujarat' },
  { code: '27', name: '27 - Maharashtra' },
  { code: '29', name: '29 - Karnataka' },
  { code: '33', name: '33 - Tamil Nadu' },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get('demo') === '1';

  const [step, setStep] = useState<number>(1);
  const [businessName, setBusinessName] = useState('Sharma Traders');
  const [gstin, setGstin] = useState('06ABCDE1234F1Z5');
  const [gstinError, setGstinError] = useState('');
  const [stateCode, setStateCode] = useState('06');
  const [turnoverSlab, setTurnoverSlab] = useState<'UNDER_5CR' | 'OVER_5CR'>('UNDER_5CR');
  const [period, setPeriod] = useState<string>(CONFIG.demo.periodCode);

  useEffect(() => {
    // If opened with ?demo=1, show quick toast and redirect to demo dashboard
    if (isDemoParam) {
      toast.success('Demo business and records loaded successfully!');
      router.push('/app');
    }
  }, [isDemoParam, router]);

  const validateGstin = (value: string) => {
    const trimmed = value.trim().toUpperCase();
    setGstin(trimmed);
    const regex = new RegExp(CONFIG.validation.gstinRegex);
    if (!regex.test(trimmed)) {
      setGstinError('GSTIN must be 15 characters (e.g. 06ABCDE1234F1Z5)');
      return false;
    }
    setGstinError('');
    return true;
  };

  const handleStep1Continue = () => {
    if (!businessName.trim()) {
      toast.error('Please enter business name');
      return;
    }
    if (!validateGstin(gstin)) {
      toast.error('Please correct your GSTIN format');
      return;
    }
    setStep(2);
  };

  const handleFinishOnboarding = async (loadDemo: boolean) => {
    if (loadDemo) {
      toast.success('Seeded demo reconciliation data!');
      router.push('/app');
      return;
    }

    try {
      await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          gstin,
          turnoverSlab,
          stateCode,
        }),
      });
      toast.success('Business profile created!');
      router.push('/app/sales');
    } catch {
      router.push('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="mx-auto w-full max-w-xl flex items-center justify-between py-4">
        <Logo href="/" size="md" />
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-[var(--color-amber)]'
                  : s < step
                  ? 'w-2 bg-[var(--color-emerald)]'
                  : 'w-2 bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Stepper Card */}
      <main className="mx-auto w-full max-w-xl my-auto">
        <Card className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl p-8">
          <CardContent className="p-0 space-y-6">
            {/* Step 1: Business Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">
                    Step 1 of 3
                  </span>
                  <h1 className="text-2xl font-extrabold text-[var(--color-text)] mt-1">
                    Your Business
                  </h1>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Enter your GST profile to automatically calibrate HSN digit checks.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sharma Traders"
                      className="w-full h-11 px-4 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-amber)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[var(--color-text)]">
                        GSTIN
                      </label>
                      <span className="text-[11px] text-[var(--color-muted)]">15-digit alphanumeric</span>
                    </div>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      onBlur={(e) => validateGstin(e.target.value)}
                      placeholder="06ABCDE1234F1Z5"
                      className={`w-full h-11 px-4 rounded-[12px] bg-[var(--color-surface-2)] border ${
                        gstinError ? 'border-[var(--color-red)]' : 'border-[var(--color-border)]'
                      } text-sm font-mono text-[var(--color-text)] focus:outline-none focus:border-[var(--color-amber)]`}
                    />
                    {gstinError && (
                      <p className="text-xs text-[var(--color-red)] mt-1">{gstinError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                        State
                      </label>
                      <select
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        className="w-full h-11 px-3 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-amber)]"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s.code} value={s.code} className="bg-[#12161D]">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                        Yearly Turnover
                      </label>
                      <div className="flex items-center gap-2 h-11">
                        <button
                          type="button"
                          onClick={() => setTurnoverSlab('UNDER_5CR')}
                          className={`flex-1 h-full rounded-[10px] text-xs font-semibold border transition-all ${
                            turnoverSlab === 'UNDER_5CR'
                              ? 'bg-[var(--color-amber)]/15 border-[var(--color-amber)] text-[var(--color-amber)]'
                              : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)]'
                          }`}
                        >
                          Under ₹5 cr
                        </button>
                        <button
                          type="button"
                          onClick={() => setTurnoverSlab('OVER_5CR')}
                          className={`flex-1 h-full rounded-[10px] text-xs font-semibold border transition-all ${
                            turnoverSlab === 'OVER_5CR'
                              ? 'bg-[var(--color-amber)]/15 border-[var(--color-amber)] text-[var(--color-amber)]'
                              : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)]'
                          }`}
                        >
                          Over ₹5 cr
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <Link
                    href="/app"
                    className="text-xs font-semibold text-[var(--color-muted)] hover:underline"
                  >
                    Skip for now
                  </Link>
                  <Button
                    type="button"
                    onClick={handleStep1Continue}
                    variant="primary"
                    size="default"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Filing Period */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">
                    Step 2 of 3
                  </span>
                  <h1 className="text-2xl font-extrabold text-[var(--color-text)] mt-1">
                    Filing Period
                  </h1>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Select the tax period for sales export and 2B credit reconciliation.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[var(--color-text)]">
                    Return Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full h-12 px-4 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] focus:outline-none focus:border-[var(--color-amber)]"
                  >
                    <option value="202609" className="bg-[#12161D]">September 2026 (Active Due Period)</option>
                    <option value="202608" className="bg-[#12161D]">August 2026</option>
                    <option value="202607" className="bg-[#12161D]">July 2026</option>
                  </select>
                  <p className="text-xs text-[var(--color-muted)]">
                    GSTR-1 is due on the 11th; 2B auto-generates around the 14th; GSTR-3B is due on the 20th.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-[var(--color-muted)] hover:underline flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    variant="primary"
                    size="default"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Get Data In */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">
                    Step 3 of 3
                  </span>
                  <h1 className="text-2xl font-extrabold text-[var(--color-text)] mt-1">
                    Get Data In
                  </h1>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Choose how you want to start exploring ZeroGap.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Demo Data Option (Preselected for judges) */}
                  <div
                    onClick={() => handleFinishOnboarding(true)}
                    className="group relative rounded-[14px] border-2 border-[var(--color-amber)] bg-[var(--color-surface-2)] p-5 cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-[10px] bg-[var(--color-amber)]/20 text-[var(--color-amber)]">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[var(--color-text)]">
                            Load demo data — 1 click (Recommended for Judges)
                          </h3>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            Pre-loads 24 sales bills, 45 purchase bills, GSTR-2B, and ₹1,84,200 simulated mismatch.
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[var(--color-amber)] bg-[var(--color-amber)]/10 px-2 py-0.5 rounded-full">
                        Instant
                      </span>
                    </div>
                  </div>

                  {/* Upload Own Bills Option */}
                  <div
                    onClick={() => handleFinishOnboarding(false)}
                    className="group rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5 cursor-pointer hover:border-[var(--color-border)]/80 hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-[10px] bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)]">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[var(--color-text)]">
                            Upload my own bills
                          </h3>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            Start clean by dropping your company's sales or purchase PDF/photo invoices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-[var(--color-muted)] hover:underline flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-xl text-center py-4 text-xs text-[var(--color-muted)]">
        ZeroGap · Team JalebiJS · AI Builder Cup 2026
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-sm font-semibold text-[var(--color-muted)]">
          Loading Onboarding...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

