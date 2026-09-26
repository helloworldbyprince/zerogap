'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Stepper } from '@/components/layout/Stepper';
import { Dropzone } from '@/components/upload/Dropzone';
import { InvoiceReviewTable } from '@/components/tables/InvoiceReviewTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SalesPage() {
  const [currentStep, setCurrentStep] = useState<number>(1); // Default to Step B (Review) for instant evaluation
  const [selectedTab, setSelectedTab] = useState<'b2b' | 'b2cl' | 'b2cs' | 'hsn' | 'docs'>('b2b');

  const steps = [
    { id: 'upload', label: '1. Upload', sublabel: 'Bills in (PDF/Image)' },
    { id: 'review', label: '2. Review', sublabel: 'Document AI extraction' },
    { id: 'gstr1', label: '3. GSTR-1', sublabel: 'Portal-ready files' },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232B36] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">
              Feature 1 · Outward Supplies
            </span>
            <Badge variant="emerald" dot className="text-[11px]">
              Active Period: {CONFIG.demo.periodLabel}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {COPY.en.landing.featureCards[0].title}
          </h1>
          <p className="text-sm text-[#9BA1A6] mt-0.5">
            Document AI reads invoices, validates HSN codes against master rates, and compiles portal-ready GSTR-1.
          </p>
        </div>

        {/* Step Navigation Pill */}
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="text-xs h-8 border-[#232B36] text-[#9BA1A6] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
          )}
          {currentStep < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.min(2, prev + 1))}
              className="text-xs h-8 border-[#232B36] text-[#ECEDEE] hover:text-white"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Stepper Bar (§9.4 Wireframe Screen 3) */}
      <div className="px-2">
        <Stepper
          steps={steps}
          currentStepIndex={currentStep}
          onStepClick={(idx) => setCurrentStep(idx)}
        />
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Step A — Upload Sales Invoices
            </h2>
            <Button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs h-8 bg-[#F5A524] text-black font-semibold hover:bg-[#D98E18]"
            >
              Skip to Review Table →
            </Button>
          </div>

          <Dropzone
            onComplete={() => setCurrentStep(1)}
            bizId="biz_sharma_traders_demo"
            period={CONFIG.demo.periodCode}
            kind="sales"
          />
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Step B — Review & Verify Extracted Fields
              </h2>
              <span className="text-xs text-[#9BA1A6] hidden sm:inline">
                (Click any row to open the Document AI inspection drawer)
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(0)}
              className="text-xs h-8 border-[#232B36] text-[#9BA1A6] hover:text-white"
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
              Upload more bills
            </Button>
          </div>

          <InvoiceReviewTable
            onProceedToGstr1={() => setCurrentStep(2)}
            bizId="biz_sharma_traders_demo"
            period={CONFIG.demo.periodCode}
          />
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          {/* Step C: GSTR-1 Preview & Handover to Phase 4 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[16px] bg-[#161B22] border border-[#232B36]">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#17C964]" />
                <h3 className="text-lg font-bold text-white">
                  GSTR-1 Ready for September 2026
                </h3>
              </div>
              <p className="text-xs text-[#9BA1A6] mt-1">
                24 invoices parsed and classified into statutory GSTR-1 tables.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast.info('GSTR-1 JSON export unlocks in Phase 4 per SPEC.md')}
                className="border-[#232B36] text-white hover:bg-[#1A2029]"
              >
                <Download className="h-4 w-4 mr-1.5 text-[#F5A524]" />
                Download JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast.info('Excel workbook generator unlocks in Phase 4 per SPEC.md')}
                className="border-[#232B36] text-white hover:bg-[#1A2029]"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1.5 text-[#17C964]" />
                Download Excel
              </Button>
            </div>
          </div>

          {/* Statutory Section Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#232B36] pb-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setSelectedTab('b2b')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedTab === 'b2b'
                    ? 'bg-[#1A2029] text-white border border-[#232B36]'
                    : 'text-[#9BA1A6] hover:text-white'
                }`}
              >
                Table 4: B2B Invoices (18)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('b2cl')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedTab === 'b2cl'
                    ? 'bg-[#1A2029] text-white border border-[#232B36]'
                    : 'text-[#9BA1A6] hover:text-white'
                }`}
              >
                Table 5: B2C Large (1)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('b2cs')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedTab === 'b2cs'
                    ? 'bg-[#1A2029] text-white border border-[#232B36]'
                    : 'text-[#9BA1A6] hover:text-white'
                }`}
              >
                Table 7: B2C Small (5)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('hsn')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedTab === 'hsn'
                    ? 'bg-[#1A2029] text-white border border-[#232B36]'
                    : 'text-[#9BA1A6] hover:text-white'
                }`}
              >
                Table 12: HSN Summary
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('docs')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedTab === 'docs'
                    ? 'bg-[#1A2029] text-white border border-[#232B36]'
                    : 'text-[#9BA1A6] hover:text-white'
                }`}
              >
                Table 13: Documents Issued
              </button>
            </div>

            {/* Table Preview Box */}
            <div className="p-8 rounded-[16px] bg-[#11141A] border border-[#232B36] text-center space-y-3">
              <Layers className="h-10 w-10 text-[#F5A524] mx-auto opacity-70" />
              <h4 className="text-sm font-semibold text-white">
                Statutory Table Preview
              </h4>
              <p className="text-xs text-[#9BA1A6] max-w-md mx-auto">
                Ready to compile into byte-exact schema format{' '}
                <code className="text-[#F5A524]">GSTR1_06ABCDE1234F1Z5_092026.json</code> and
                Excel workbook in Phase 4.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="text-xs border-[#232B36] text-[#ECEDEE] mt-2"
              >
                ← Back to Invoice Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
