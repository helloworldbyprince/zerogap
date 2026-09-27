'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
import { useLanguage } from '@/lib/LanguageContext';
import {
  FileText,
  Download,
  Share2,
  Printer,
  Copy,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  Building,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';
  const [copied, setCopied] = useState<boolean>(false);

  const generatedTimestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const topIssues = [
    {
      id: '1',
      severity: 'red' as const,
      title: 'Sharma Traders · INV-104 (₹58,000)',
      impact: '₹10,440 blocked ITC',
      summary:
        'Vendor did not file invoice in GSTR-1. Credit blocked under Section 16(2)(aa) until vendor uploads.',
    },
    {
      id: '2',
      severity: 'red' as const,
      title: 'Shiva Industrial Fasteners · INV-119 (₹8,20,000)',
      impact: '₹1,47,600 blocked ITC',
      summary:
        'Major supplier invoice missing from GSTR-2B. High priority DRC-01C risk if claimed in GSTR-3B.',
    },
    {
      id: '3',
      severity: 'amber' as const,
      title: 'Apex Industrial Packaging · INV-122 (₹35,000)',
      impact: '₹6,300 rate mismatch',
      summary:
        'Billed at 18% in your books, but supplier reported 0% on GST portal. Adjustment required.',
    },
  ];

  const handleCopyWhatsApp = () => {
    const text = `*ZeroGap GST Reconciliation Summary*
Business: ${CONFIG.demo.businessName}
Period: ${CONFIG.demo.periodLabel}
Generated: ${generatedTimestamp}

*Key Metrics:*
• Match Score: ${CONFIG.demo.matchScore}% (41/45 bills matched)
• Tax Credit at Risk: ₹1,84,200
• GSTR-1 Tax Liability: ₹1,51,560
• GSTR-2B ITC Available: ₹1,42,300
• 3B Credit Gap: ₹2,300 (Rule 88D review)

*Top Issues Requiring Action:*
1. [High Risk] Sharma Traders (INV-104): ₹10,440 unfiled by vendor
2. [High Risk] Shiva Fasteners (INV-119): ₹1,47,600 missing in 2B
3. [Review] Apex Packaging (INV-122): ₹6,300 value mismatch
Bonus: ₹8,500 unclaimed ITC found from Global Cable Corp!

Generated with ZeroGap (Zero gap. Zero notice.)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Formatted summary copied to clipboard for WhatsApp/Email!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top Header (Hidden during browser print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">
              {isHi ? 'ऑडिट रिपोर्ट्स और क्लाइंट सारांश' : 'Audit Reports & Client Summary'}
            </span>
            <Badge variant="emerald" dot className="text-[11px]">
              Ready to Export
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#111418]">
            {isHi ? 'मासिक समाधान रिपोर्ट' : 'Monthly Reconciliation Report'}
          </h1>
          <p className="text-sm text-[#5F6B7A] mt-0.5">
            {isHi
              ? 'प्रिंट-रेडी PDF डाउनलोड करें या सीए / क्लाइंट के लिए व्हाट्सएप सारांश कॉपी करें।'
              : 'Print-stylesheet PDF export for audit documentation and 1-click WhatsApp client briefing.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-medium border-[#E3E7EE] hover:bg-[#F6F7F9] text-[#111418] flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[#17C964]" />
            {isHi ? 'प्रिंट / PDF डाउनलोड करें' : 'Download PDF'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyWhatsApp}
            className="text-xs font-medium bg-[#F5A524] hover:bg-[#F5A524]/90 text-[#1A1A1A] flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Share2 className="h-4 w-4" />
            {copied
              ? isHi
                ? 'कॉपी हो गया'
                : 'Copied'
              : isHi
              ? 'व्हाट्सएप के लिए कॉपी करें'
              : 'Copy summary for WhatsApp'}
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Printable Report Container (§9.4 Wireframe Screen 7)
      ────────────────────────────────────────────────────────────── */}
      <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#E3E7EE] pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold tracking-tight text-[#111418]">
                ZeroGap
              </span>
              <span className="text-xs text-[#5F6B7A]">
                · {CONFIG.app.tagline}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#111418]">
              Monthly Reconciliation Summary — {CONFIG.demo.periodLabel}
            </h2>
            <div className="text-xs text-[#5F6B7A] mt-1 flex flex-wrap gap-x-4">
              <span>Business: <strong className="text-[#111418]">{CONFIG.demo.businessName}</strong></span>
              <span>GSTIN: <strong className="text-[#111418] font-mono">06ABCDE1234F1Z5</strong></span>
              <span>Generated: <strong className="text-[#111418]">{generatedTimestamp}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase font-medium text-[#5F6B7A] block">
              Statutory Compliance Status
            </span>
            <Badge variant="amber" dot className="text-xs font-medium mt-1">
              Review Required (Rule 88D)
            </Badge>
          </div>
        </div>

        {/* Hero KPI Band */}
        <div className="p-4 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE]">
          <div className="text-sm font-semibold text-[#111418] flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-[#F31260] tabular-nums">
              Money at risk: ₹1,84,200
            </span>
            <span className="text-[#5F6B7A]">·</span>
            <span className="text-[#17C964] tabular-nums">
              Match score: {CONFIG.demo.matchScore}%
            </span>
            <span className="text-[#5F6B7A]">·</span>
            <span className="text-[#F5A524]">
              2 statutory gaps detected
            </span>
          </div>
        </div>

        {/* Top 3 Issues (One-Liners) (§9.4 Wireframe Screen 7) */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5F6B7A]">
            Top Issues Requiring Immediate CA / Vendor Follow-up
          </h3>

          <div className="space-y-2.5">
            {topIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 rounded-[12px] border border-[#E3E7EE] bg-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">
                    {issue.severity === 'red' ? (
                      <AlertCircle className="h-4 w-4 text-[#F31260]" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-[#F5A524]" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[#111418]">
                      {issue.title}
                    </div>
                    <p className="text-[#5F6B7A] mt-0.5">
                      {issue.summary}
                    </p>
                  </div>
                </div>
                <div className="ml-6 sm:ml-0 font-medium tabular-nums text-[#F31260] flex-shrink-0">
                  {issue.impact}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-[12px] bg-[#FDF6E4] border border-[#F5A524]/30 text-xs text-[#111418] flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-[#F5A524] flex-shrink-0" />
            <span>
              <strong>Unclaimed Credit Opportunity:</strong> Global Cable Corp (INV-208) has uploaded ₹8,500 ITC in 2B that is missing from your purchase register. Record it to claim savings!
            </span>
          </div>
        </div>

        {/* Period Totals Table (§9.4 Wireframe Screen 7) */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5F6B7A]">
            Tax Triangle Audit & Liability Breakdown
          </h3>

          <div className="overflow-x-auto rounded-[12px] border border-[#E3E7EE]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F9] text-[#5F6B7A] uppercase text-[11px] font-medium tracking-wider border-b border-[#E3E7EE]">
                <tr>
                  <th className="py-2.5 px-4">Metric / Table</th>
                  <th className="py-2.5 px-4">Statutory Source</th>
                  <th className="py-2.5 px-4 text-right">Taxable Value (₹)</th>
                  <th className="py-2.5 px-4 text-right">Tax Amount (₹)</th>
                  <th className="py-2.5 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EE]">
                <tr className="hover:bg-[#F6F7F9]">
                  <td className="py-2.5 px-4 font-semibold text-[#111418]">
                    Outward Supplies (GSTR-1)
                  </td>
                  <td className="py-2.5 px-4 text-[#5F6B7A]">
                    24 Sales Invoices
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-[#111418]">
                    ₹8,42,000
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-[#111418]">
                    ₹1,51,560
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant="emerald" dot className="text-[10px]">
                      Matched
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-[#F6F7F9]">
                  <td className="py-2.5 px-4 font-semibold text-[#111418]">
                    Inward Supplies (GSTR-2B)
                  </td>
                  <td className="py-2.5 px-4 text-[#5F6B7A]">
                    42 Supplier Bills
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-[#111418]">
                    ₹7,90,555
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-[#17C964]">
                    ₹1,42,300
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant="emerald" dot className="text-[10px]">
                      Portal 2B
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-[#F6F7F9]">
                  <td className="py-2.5 px-4 font-semibold text-[#111418]">
                    Monthly Return (GSTR-3B)
                  </td>
                  <td className="py-2.5 px-4 text-[#5F6B7A]">
                    Tax Paid / Claimed
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-[#111418]">
                    ₹8,42,000
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-[#F31260]">
                    ₹1,44,600 (ITC)
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant="red" dot className="text-[10px]">
                      ₹2,300 Gap
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer in Print */}
        <div className="pt-4 border-t border-[#E3E7EE] text-[11px] text-[#5F6B7A] flex flex-col sm:flex-row justify-between gap-2">
          <span>&ldquo;A gap is a question, not a verdict. Review the possible causes before deciding.&rdquo;</span>
          <span>ZeroGap · Team JalebiJS · AI Builder Cup 2026</span>
        </div>
      </Card>
    </div>
  );
}
