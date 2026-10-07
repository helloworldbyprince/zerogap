'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Stepper } from '@/components/layout/Stepper';
import { Dropzone } from '@/components/upload/Dropzone';
import { InvoiceReviewTable } from '@/components/tables/InvoiceReviewTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import { cn } from '@/lib/utils';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/lib/WorkspaceContext';

export default function SalesPage() {
  const { activeBusiness, activeBusinessId, activePeriod, isDemo } = useWorkspace();
  const [currentStep, setCurrentStep] = useState<number>(1); // Default to Step B (Review) for instant evaluation
  const [selectedTab, setSelectedTab] = useState<'b2b' | 'b2cl' | 'b2cs' | 'hsn' | 'docs'>('b2b');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [acknowledgedGate, setAcknowledgedGate] = useState(false);

  const steps = [
    { id: 'upload', label: '1. Upload', sublabel: 'Bills in (PDF/Image)' },
    { id: 'review', label: '2. Review', sublabel: 'Document AI extraction' },
    { id: 'gstr1', label: '3. GSTR-1', sublabel: 'Portal-ready files' },
  ];

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices?bizId=${encodeURIComponent(activeBusinessId)}&period=${encodeURIComponent(activePeriod)}&kind=sales`);
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [activeBusinessId, activePeriod]);

  const redRows = invoices.filter((i) => i.status === 'red');
  const hasRedErrors = redRows.length > 0;
  const isDownloadUnlocked = !hasRedErrors || acknowledgedGate;

  const handleDownload = (format: 'json' | 'xlsx') => {
    if (!isDownloadUnlocked) {
      toast.error(`Fix the ${redRows.length} red rows or tick 'I have checked' to download.`);
      return;
    }

    const bypassParam = acknowledgedGate ? '&bypassGate=true' : '';
    const downloadUrl = `/api/gstr1/export?bizId=${encodeURIComponent(activeBusinessId)}&period=${encodeURIComponent(activePeriod)}&format=${format}${bypassParam}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `GSTR1_06ABCDE1234F1Z5_092026.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading GSTR-1 ${format.toUpperCase()} file`);
  };

  // Filter sections for Tab Preview in Step C
  const b2bInvoices = invoices.filter((i) => i.section === 'B2B');
  const b2clInvoices = invoices.filter((i) => i.section === 'B2CL');
  const b2csInvoices = invoices.filter((i) => i.section === 'B2CS');

  // HSN Aggregates
  const hsnMap = new Map<string, any>();
  for (const inv of invoices) {
    const itm = inv.items?.[0] || { hsn: '8471', desc: 'Computer Parts', qty: 1, txval: inv.totals?.txval || 0, iamt: 0, camt: 0, samt: 0 };
    const code = itm.hsn || '8471';
    const ex = hsnMap.get(code) || {
      hsn: code,
      desc: itm.desc || 'General Goods',
      qty: 0,
      txval: 0,
      iamt: 0,
      camt: 0,
      samt: 0,
    };
    ex.qty += (itm.qty || 1);
    ex.txval += itm.txval;
    ex.iamt += (itm.iamt || inv.totals?.iamt || 0);
    ex.camt += (itm.camt || inv.totals?.camt || 0);
    ex.samt += (itm.samt || inv.totals?.samt || 0);
    hsnMap.set(code, ex);
  }
  const hsnList = Array.from(hsnMap.values());

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#9E6400] tracking-wider uppercase">
              Feature 1 · Outward Supplies
            </span>
            <Badge variant="emerald" dot className="text-[11px]">
              {isDemo ? 'Demo workspace' : activeBusiness?.name || 'Business'} · {activePeriod.slice(4, 6)}/{activePeriod.slice(0, 4)}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] text-[#111418]">
            {COPY.en.landing.featureCards[0].title}
          </h1>
          <p className="text-sm text-[#5F6B7A] mt-0.5">
            Document AI reads invoices, validates HSN codes against master rates, and compiles portal-ready GSTR-1.
          </p>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentStep((prev) => Math.max(0, prev - 1));
                fetchInvoices();
              }}
              className="text-xs h-8 border-[#E3E7EE] text-[#5F6B7A] hover:text-[#111418]"
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
              onClick={() => {
                setCurrentStep((prev) => Math.min(2, prev + 1));
                fetchInvoices();
              }}
              className="text-xs h-8 border-[#E3E7EE] text-[#111418] hover:bg-[#F6F7F9]"
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
          onStepClick={(idx) => {
            setCurrentStep(idx);
            fetchInvoices();
          }}
        />
      </div>

      {/* STEP A — UPLOAD */}
      {currentStep === 0 && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#111418]">
              Step A — Upload Sales Invoices
            </h2>
            <Button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                fetchInvoices();
              }}
              variant="primary"
              size="sm"
              className="text-xs h-8 font-medium"
            >
              Skip to Review Table →
            </Button>
          </div>

          <Dropzone
            onComplete={() => {
              setCurrentStep(1);
              fetchInvoices();
            }}
            bizId={activeBusinessId}
            period={activePeriod}
            kind="sales"
          />
        </div>
      )}

      {/* STEP B — REVIEW TABLE */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#111418]">
                Step B — Review & Verify Extracted Fields
              </h2>
              <span className="text-xs text-[#5F6B7A] hidden sm:inline">
                (Click any row to open the Document AI inspection drawer)
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(0)}
              className="text-xs h-8 border-[#E3E7EE] text-[#5F6B7A] hover:text-[#111418]"
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
              Upload more bills
            </Button>
          </div>

          <InvoiceReviewTable
            onProceedToGstr1={() => {
              setCurrentStep(2);
              fetchInvoices();
            }}
            bizId={activeBusinessId}
            period={activePeriod}
          />
        </div>
      )}

      {/* STEP C — GSTR-1 PREVIEW & EXPORT GATE */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          {/* Header Action Strip with 2 Download Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[16px] bg-white border border-[#E3E7EE] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#17C964]" />
                <h3 className="text-lg font-semibold text-[#111418]">
                  GSTR-1 Package · September 2026
                </h3>
              </div>
              <p className="text-xs text-[#5F6B7A] mt-1">
                {invoices.length} invoices prepared for GSTIN{' '}
                <strong className="text-[#111418] font-mono">06ABCDE1234F1Z5</strong> (Filing period:{' '}
                <strong className="text-[#111418] font-mono">092026</strong>)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => handleDownload('json')}
                disabled={!isDownloadUnlocked}
                variant="primary"
                className="font-medium text-xs sm:text-sm px-4 h-9 shadow-xs"
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownload('xlsx')}
                disabled={!isDownloadUnlocked}
                className="font-medium text-xs sm:text-sm px-4 h-9 border-[#17C964]/40 text-[#0F8C43] hover:bg-[#17C964]/10 bg-white"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>

          {/* Validation Gate Banner (§2.6 & §9.4 Wireframe Screen 3) */}
          <div
            className={cn(
              'p-4 rounded-[12px] border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs',
              hasRedErrors && !acknowledgedGate
                ? 'bg-[#FDF6E4] border-[#F5A524]/30 text-[#111418]'
                : 'bg-[#17C964]/10 border-[#17C964]/25 text-[#0F8C43]'
            )}
          >
            <div className="flex items-center gap-2.5">
              {hasRedErrors && !acknowledgedGate ? (
                <AlertOctagon className="h-4 w-4 text-[#F31260] shrink-0" />
              ) : (
                <Check className="h-4 w-4 text-[#17C964] stroke-[3] shrink-0" />
              )}
              <div>
                {hasRedErrors ? (
                  <span>
                    Fix the{' '}
                    <strong className="text-[#C70E4E] font-semibold">
                      {redRows.length} red rows
                    </strong>{' '}
                    above (or tick 'I have checked') to unlock the download.
                  </span>
                ) : (
                  <span className="font-medium text-[#0F8C43]">
                    All statutory validation checks passed (0 red errors). Ready for official GST portal upload.
                  </span>
                )}
              </div>
            </div>

            {hasRedErrors && (
              <label className="flex items-center gap-2 cursor-pointer text-[#9E6400] select-none shrink-0 font-medium">
                <input
                  type="checkbox"
                  checked={acknowledgedGate}
                  onChange={(e) => setAcknowledgedGate(e.target.checked)}
                  className="rounded border-[#E3E7EE] text-[#F5A524] focus:ring-0"
                />
                <span>I have checked</span>
              </label>
            )}
          </div>

          {/* Statutory Section Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setSelectedTab('b2b')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedTab === 'b2b'
                    ? 'bg-white text-[#111418] border border-[#E3E7EE] shadow-xs font-semibold'
                    : 'text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                Table 4: B2B Invoices ({b2bInvoices.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('b2cl')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedTab === 'b2cl'
                    ? 'bg-white text-[#111418] border border-[#E3E7EE] shadow-xs font-semibold'
                    : 'text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                Table 5: B2C Large ({b2clInvoices.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('b2cs')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedTab === 'b2cs'
                    ? 'bg-white text-[#111418] border border-[#E3E7EE] shadow-xs font-semibold'
                    : 'text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                Table 7: B2C Small ({b2csInvoices.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('hsn')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedTab === 'hsn'
                    ? 'bg-white text-[#111418] border border-[#E3E7EE] shadow-xs font-semibold'
                    : 'text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                Table 12: HSN Summary ({hsnList.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('docs')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedTab === 'docs'
                    ? 'bg-white text-[#111418] border border-[#E3E7EE] shadow-xs font-semibold'
                    : 'text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                Table 13: Documents Issued (1)
              </button>
            </div>

            {/* TAB CONTENT: B2B */}
            {selectedTab === 'b2b' && (
              <div className="rounded-[16px] border border-[#E3E7EE] bg-white overflow-hidden text-xs shadow-xs">
                <div className="p-3 bg-[#F6F7F9] border-b border-[#E3E7EE] flex items-center justify-between text-[#5F6B7A] font-medium">
                  <span>Table 4: Registered Outward Supplies (Taxable with GSTIN)</span>
                  <span>{b2bInvoices.length} invoices</span>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E3E7EE] bg-[#F6F7F9] text-[#5F6B7A] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Recipient GSTIN</th>
                        <th className="py-2.5 px-4">Customer Name</th>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                        <th className="py-2.5 px-3 text-center">Rate</th>
                        <th className="py-2.5 px-3 text-right">Tax (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7EE]">
                      {b2bInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#F6F7F9] transition-colors">
                          <td className="py-2.5 px-4 font-mono text-[#111418]">{inv.ctin || '—'}</td>
                          <td className="py-2.5 px-4 text-[#111418] font-medium">{inv.ctinName}</td>
                          <td className="py-2.5 px-3 font-mono text-[#111418]">{inv.inum}</td>
                          <td className="py-2.5 px-3 text-[#5F6B7A]">{inv.idt}</td>
                          <td className="py-2.5 px-3 text-right text-[#111418] font-medium tabular-nums">
                            ₹{inv.totals?.txval.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-center text-[#111418]">
                            {inv.items?.[0]?.rt || 18}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#111418] tabular-nums">
                            ₹{inv.totals?.totalTax.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: B2CL */}
            {selectedTab === 'b2cl' && (
              <div className="rounded-[16px] border border-[#E3E7EE] bg-white overflow-hidden text-xs shadow-xs">
                <div className="p-3 bg-[#F6F7F9] border-b border-[#E3E7EE] flex items-center justify-between text-[#5F6B7A] font-medium">
                  <span>Table 5: Large Inter-State Unregistered Supplies (Invoice &gt; ₹2,50,000)</span>
                  <span>{b2clInvoices.length} invoices</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E3E7EE] bg-[#F6F7F9] text-[#5F6B7A] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Place of Supply</th>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                        <th className="py-2.5 px-3 text-center">Rate</th>
                        <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7EE]">
                      {b2clInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#F6F7F9] transition-colors">
                          <td className="py-2.5 px-4 text-[#111418] font-mono">{inv.pos}-Rajasthan</td>
                          <td className="py-2.5 px-3 font-mono text-[#111418]">{inv.inum}</td>
                          <td className="py-2.5 px-3 text-[#5F6B7A]">{inv.idt}</td>
                          <td className="py-2.5 px-3 text-right text-[#111418] font-medium tabular-nums">
                            ₹{inv.totals?.txval.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-center text-[#111418]">
                            {inv.items?.[0]?.rt || 18}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#111418] tabular-nums">
                            ₹{inv.totals?.iamt.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: B2CS */}
            {selectedTab === 'b2cs' && (
              <div className="rounded-[16px] border border-[#E3E7EE] bg-white overflow-hidden text-xs shadow-xs">
                <div className="p-3 bg-[#F6F7F9] border-b border-[#E3E7EE] flex items-center justify-between text-[#5F6B7A] font-medium">
                  <span>Table 7: Other B2C Supplies (Aggregated by State & Rate)</span>
                  <span>{b2csInvoices.length} invoices</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E3E7EE] bg-[#F6F7F9] text-[#5F6B7A] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Supply Type</th>
                        <th className="py-2.5 px-3">Place of Supply</th>
                        <th className="py-2.5 px-3 text-center">Rate</th>
                        <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                        <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                        <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7EE]">
                      <tr className="hover:bg-[#F6F7F9] transition-colors">
                        <td className="py-2.5 px-4 text-[#111418] font-medium">Intra-State</td>
                        <td className="py-2.5 px-3 font-mono text-[#111418]">06-Haryana</td>
                        <td className="py-2.5 px-3 text-center text-[#111418]">18%</td>
                        <td className="py-2.5 px-3 text-right text-[#111418] font-medium tabular-nums">
                          ₹{b2csInvoices.reduce((s, i) => s + (i.totals?.txval || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#111418] tabular-nums">
                          ₹{b2csInvoices.reduce((s, i) => s + (i.totals?.camt || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#111418] tabular-nums">
                          ₹{b2csInvoices.reduce((s, i) => s + (i.totals?.samt || 0), 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HSN */}
            {selectedTab === 'hsn' && (
              <div className="rounded-[16px] border border-[#E3E7EE] bg-white overflow-hidden text-xs shadow-xs">
                <div className="p-3 bg-[#F6F7F9] border-b border-[#E3E7EE] flex items-center justify-between text-[#5F6B7A] font-medium">
                  <span>Table 12: HSN Summary of Outward Supplies</span>
                  <span>{hsnList.length} distinct HSN codes</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E3E7EE] bg-[#F6F7F9] text-[#5F6B7A] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">HSN/SAC</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-3">UQC</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                        <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                        <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                        <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7EE]">
                      {hsnList.map((h, idx) => (
                        <tr key={idx} className="hover:bg-[#F6F7F9] transition-colors">
                          <td className="py-2.5 px-4 font-mono font-medium text-[#111418]">{h.hsn}</td>
                          <td className="py-2.5 px-4 text-[#111418] max-w-[200px] truncate">{h.desc}</td>
                          <td className="py-2.5 px-3 font-mono text-[#5F6B7A]">NOS</td>
                          <td className="py-2.5 px-3 text-center text-[#111418] tabular-nums">{h.qty}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#111418] tabular-nums">
                            ₹{h.txval.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#111418] tabular-nums">
                            ₹{h.iamt.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#111418] tabular-nums">
                            ₹{h.camt.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#111418] tabular-nums">
                            ₹{h.samt.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCS */}
            {selectedTab === 'docs' && (
              <div className="rounded-[16px] border border-[#E3E7EE] bg-white overflow-hidden text-xs shadow-xs">
                <div className="p-3 bg-[#F6F7F9] border-b border-[#E3E7EE] flex items-center justify-between text-[#5F6B7A] font-medium">
                  <span>Table 13: Documents Issued During the Tax Period</span>
                  <span>1 serial range</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E3E7EE] bg-[#F6F7F9] text-[#5F6B7A] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Nature of Document</th>
                        <th className="py-2.5 px-3">Sr. No. From</th>
                        <th className="py-2.5 px-3">Sr. No. To</th>
                        <th className="py-2.5 px-3 text-center">Total Number</th>
                        <th className="py-2.5 px-3 text-center">Cancelled</th>
                        <th className="py-2.5 px-3 text-center">Net Issued</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7EE]">
                      <tr className="hover:bg-[#F6F7F9] transition-colors">
                        <td className="py-2.5 px-4 text-[#111418] font-medium">Invoices for outward supply</td>
                        <td className="py-2.5 px-3 font-mono text-[#9E6400]">INV-001</td>
                        <td className="py-2.5 px-3 font-mono text-[#9E6400]">INV-024</td>
                        <td className="py-2.5 px-3 text-center text-[#111418] tabular-nums">{invoices.length}</td>
                        <td className="py-2.5 px-3 text-center text-[#5F6B7A]">0</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[#0F8C43] tabular-nums">
                          {invoices.length}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
