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
import { WORKSPACE_STORAGE_KEYS } from '@/lib/WorkspaceContext';
import { auth, onAuthStateChanged } from '@/lib/firebase';

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
  const [authReady, setAuthReady] = useState(isDemoParam);

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
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.business, 'biz_sharma_traders_demo');
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.period, CONFIG.demo.periodCode);
      toast.success('Demo business and records loaded successfully!');
      router.push('/app');
    }
  }, [isDemoParam, router]);

  useEffect(() => {
    if (isDemoParam) return;
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/sign-up');
        return;
      }
      setAuthReady(true);
    });
  }, [isDemoParam, router]);

  if (!authReady) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-sm text-[#5F6B7A]">
        Checking your account…
      </main>
    );
  }

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
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.business, 'biz_sharma_traders_demo');
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.businessGstin, '06ABCDE1234F1Z5');
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.period, period);
      toast.success('Seeded demo reconciliation data!');
      router.push('/app');
      return;
    }

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({
          name: businessName,
          gstin,
          turnoverSlab,
          stateCode,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || 'Could not create business profile');
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.business, payload.bizId);
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.businessGstin, gstin);
      window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.period, period);
      toast.success('Business profile created!');
      router.push('/app/sales');
    } catch (error: any) {
      toast.error(error.message || 'Could not create business profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#111418] flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="mx-auto w-full max-w-xl flex items-center justify-between py-4">
        <Logo href="/" size="md" />
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-[#F5A524]'
                  : s < step
                  ? 'w-2 bg-[#17C964]'
                  : 'w-2 bg-[#E3E7EE]'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Stepper Card */}
      <main className="mx-auto w-full max-w-xl my-auto">
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white shadow-xs p-8">
          <CardContent className="p-0 space-y-6">
            {/* Step 1: Business Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9E6400]">
                    Step 1 of 3
                  </span>
                  <h1 className="text-[21px] font-semibold text-[#111418] mt-1">
                    Your business
                  </h1>
                  <p className="text-sm text-[#5F6B7A] mt-1">
                    Enter your GST profile to automatically calibrate HSN digit checks.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111418] mb-1.5">
                      Business name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sharma Traders"
                      className="w-full h-11 px-4 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE] text-sm text-[#111418] focus:outline-none focus:border-[#F5A524] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#111418]">
                        GSTIN
                      </label>
                      <span className="text-[11px] text-[#5F6B7A]">15-digit alphanumeric</span>
                    </div>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      onBlur={(e) => validateGstin(e.target.value)}
                      placeholder="06ABCDE1234F1Z5"
                      className={`w-full h-11 px-4 rounded-[12px] bg-[#F6F7F9] border ${
                        gstinError ? 'border-[#F31260]' : 'border-[#E3E7EE]'
                      } text-sm font-mono text-[#111418] focus:outline-none focus:border-[#F5A524] focus:bg-white uppercase transition-colors`}
                    />
                    {gstinError && (
                      <p className="text-xs text-[#F31260] mt-1">{gstinError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#111418] mb-1.5">
                        State
                      </label>
                      <select
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        className="w-full h-11 px-3 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE] text-sm text-[#111418] focus:outline-none focus:border-[#F5A524] focus:bg-white transition-colors"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s.code} value={s.code} className="bg-white text-[#111418]">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#111418] mb-1.5">
                        Yearly turnover
                      </label>
                      <div className="flex items-center gap-2 h-11">
                        <button
                          type="button"
                          onClick={() => setTurnoverSlab('UNDER_5CR')}
                          className={`flex-1 h-full rounded-[12px] text-xs font-medium border transition-all cursor-pointer ${
                            turnoverSlab === 'UNDER_5CR'
                              ? 'bg-[#FDF6E4] border-[#F5A524] text-[#9E6400] font-semibold'
                              : 'bg-[#F6F7F9] border-[#E3E7EE] text-[#5F6B7A] hover:text-[#111418]'
                          }`}
                        >
                          Under ₹5 cr
                        </button>
                        <button
                          type="button"
                          onClick={() => setTurnoverSlab('OVER_5CR')}
                          className={`flex-1 h-full rounded-[12px] text-xs font-medium border transition-all cursor-pointer ${
                            turnoverSlab === 'OVER_5CR'
                              ? 'bg-[#FDF6E4] border-[#F5A524] text-[#9E6400] font-semibold'
                              : 'bg-[#F6F7F9] border-[#E3E7EE] text-[#5F6B7A] hover:text-[#111418]'
                          }`}
                        >
                          Over ₹5 cr
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E3E7EE]">
                  <Link
                    href="/app"
                    className="text-xs font-medium text-[#5F6B7A] hover:underline"
                  >
                    Skip for now
                  </Link>
                  <Button
                    type="button"
                    onClick={handleStep1Continue}
                    variant="primary"
                    size="default"
                    className="font-medium shadow-xs"
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9E6400]">
                    Step 2 of 3
                  </span>
                  <h1 className="text-[21px] font-semibold text-[#111418] mt-1">
                    Filing period
                  </h1>
                  <p className="text-sm text-[#5F6B7A] mt-1">
                    Select the tax period for sales export and 2B credit reconciliation.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-medium text-[#111418]">
                    Return period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full h-12 px-4 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE] text-sm font-semibold text-[#111418] focus:outline-none focus:border-[#F5A524] focus:bg-white transition-colors"
                  >
                    <option value="202609" className="bg-white text-[#111418]">September 2026 (Active Due Period)</option>
                    <option value="202608" className="bg-white text-[#111418]">August 2026</option>
                    <option value="202607" className="bg-white text-[#111418]">July 2026</option>
                  </select>
                  <p className="text-xs text-[#5F6B7A]">
                    GSTR-1 is due on the 11th; 2B auto-generates around the 14th; GSTR-3B is due on the 20th.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E3E7EE]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-medium text-[#5F6B7A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    variant="primary"
                    size="default"
                    className="font-medium shadow-xs"
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9E6400]">
                    Step 3 of 3
                  </span>
                  <h1 className="text-[21px] font-semibold text-[#111418] mt-1">
                    Get data in
                  </h1>
                  <p className="text-sm text-[#5F6B7A] mt-1">
                    Choose how you want to start exploring ZeroGap.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Demo Data Option (Preselected for judges) */}
                  <div
                    onClick={() => handleFinishOnboarding(true)}
                    className="group relative rounded-[16px] border-2 border-[#F5A524] bg-[#FDF6E4] p-5 cursor-pointer shadow-xs hover:border-[#D98E18] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-[12px] bg-white border border-[#F5A524]/30 text-[#F5A524] shadow-xs">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-[#111418]">
                            Load demo data — 1 click (Recommended for judges)
                          </h3>
                          <p className="text-xs text-[#5F6B7A] mt-0.5">
                            Pre-loads 24 sales bills, 45 purchase bills, GSTR-2B, and ₹1,84,200 simulated mismatch.
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#9E6400] bg-white px-2.5 py-0.5 rounded-full border border-[#F5A524]/30 shadow-xs">
                        Instant
                      </span>
                    </div>
                  </div>

                  {/* Upload Own Bills Option */}
                  <div
                    onClick={() => handleFinishOnboarding(false)}
                    className="group rounded-[16px] border border-[#E3E7EE] bg-white p-5 cursor-pointer hover:border-[#CBD2DE] shadow-xs transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-[12px] bg-[#F6F7F9] text-[#5F6B7A] border border-[#E3E7EE]">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-[#111418]">
                            Upload my own bills
                          </h3>
                          <p className="text-xs text-[#5F6B7A] mt-0.5">
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
                    className="text-xs font-medium text-[#5F6B7A] hover:underline flex items-center gap-1 cursor-pointer"
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
      <footer className="mx-auto w-full max-w-xl text-center py-4 text-xs text-[#5F6B7A]">
        ZeroGap · Team JalebiJS · AI Builder Cup 2026
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-sm font-medium text-[#5F6B7A]">
          Loading onboarding...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
