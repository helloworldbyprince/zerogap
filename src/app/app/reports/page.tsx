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
  Info,
  Calendar,
  Building,
  ShieldCheck,
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
      severity: 'red',
      icon: '🔴',
      title: 'Sharma Traders · INV-104 (₹58,000)',
      impact: '₹10,440 blocked ITC',
      summary:
        'Vendor did not file invoice in GSTR-1. Credit blocked under Section 16(2)(aa) until vendor uploads.',
    },
    {
      id: '2',
      severity: 'red',
      icon: '🔴',
      title: 'Shiva Industrial Fasteners · INV-119 (₹8,20,000)',
      impact: '₹1,47,600 blocked ITC',
      summary:
        'Major supplier invoice missing from GSTR-2B. High priority DRC-01C risk if claimed in GSTR-3B.',
    },
    {
      id: '3',
      severity: 'amber',
      icon: '🟡',
      title: 'Apex Industrial Packaging · INV-122 (₹35,000)',
      impact: '₹6,300 rate mismatch',
      summary:
        'Billed at 18% in your books, but supplier reported 0% on GST portal. Adjustment required.',
    },
  ];

  const handleCopyWhatsApp = () => {
    const text = `*ZeroGap GST Reconciliation Summary*
🏢 Business: ${CONFIG.demo.businessName}
📅 Period: ${CONFIG.demo.periodLabel}
⏱ Generated: ${generatedTimestamp}

*Key Metrics:*
• Match Score: ${CONFIG.demo.matchScore}% (41/45 bills matched)
• Tax Credit at Risk: ₹1,84,200
• GSTR-1 Tax Liability: ₹1,51,560
• GSTR-2B ITC Available: ₹1,42,300
• 3B Credit Gap: ₹2,300 (Rule 88D review)

*Top Issues Requiring Action:*
1. 🔴 Sharma Traders (INV-104): ₹10,440 unfiled by vendor
2. 🔴 Shiva Fasteners (INV-119): ₹1,47,600 missing in 2B
3. 🟡 Apex Packaging (INV-122): ₹6,300 value mismatch
💡 *Bonus:* ₹8,500 unclaimed ITC found from Global Cable Corp!

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232B36] pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">
              {isHi ? 'ऑडिट रिपोर्ट्स और क्लाइंट सारांश' : 'Audit Reports & Client Summary'}
            </span>
            <Badge variant="emerald" dot className="text-[11px]">
              Ready to Export
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isHi ? 'मासिक समाधान रिपोर्ट' : 'Monthly Reconciliation Report'}
          </h1>
          <p className="text-sm text-[#9BA1A6] mt-0.5">
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
            className="text-xs border-[#232B36] hover:border-[#17C964] text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[#17C964]" />
            {isHi ? 'प्रिंट / PDF डाउनलोड करें' : 'Download PDF'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyWhatsApp}
            className="text-xs font-bold bg-[#F5A524] hover:bg-[#F5A524]/90 text-black flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Share2 className="h-4 w-4" />
            {copied
              ? isHi
                ? 'कॉपी हो गया ✓'
                : 'Copied ✓'
              : isHi
              ? 'व्हाट्सएप के लिए कॉपी करें'
              : 'Copy summary for WhatsApp'}
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Printable Report Container (§9.4 Wireframe Screen 7)
      ────────────────────────────────────────────────────────────── */}
      <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-6 sm:p-8 space-y-6 shadow-md print:border-none print:bg-white print:text-black print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#232B36] pb-5 gap-4 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black tracking-tight text-white print:text-black">
                ZeroGap
              </span>
              <span className="text-xs text-[#9BA1A6] print:text-gray-600">
                · {CONFIG.app.tagline}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white print:text-black">
              Monthly Reconciliation Summary — {CONFIG.demo.periodLabel}
            </h2>
            <div className="text-xs text-[#9BA1A6] print:text-gray-600 mt-1 flex flex-wrap gap-x-4">
              <span>Business: <strong>{CONFIG.demo.businessName}</strong></span>
              <span>GSTIN: <strong>06ABCDE1234F1Z5</strong></span>
              <span>Generated: <strong>{generatedTimestamp}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#9BA1A6] print:text-gray-500 block">
              Statutory Compliance Status
            </span>
            <Badge variant="amber" dot className="text-xs font-bold mt-1">
              Review Required (Rule 88D)
            </Badge>
          </div>
        </div>

        {/* Hero KPI Band */}
        <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#232B36] print:bg-gray-50 print:border-gray-200">
          <div className="text-sm font-bold text-white print:text-black flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-[#F31260] print:text-red-600 font-extrabold">
              Money at risk: ₹1,84,200
            </span>
            <span>·</span>
            <span className="text-[#17C964] print:text-green-600">
              Match score: {CONFIG.demo.matchScore}%
            </span>
            <span>·</span>
            <span className="text-[#F5A524] print:text-amber-600">
              2 statutory gaps detected
            </span>
          </div>
        </div>

        {/* Top 3 Issues (One-Liners) (§9.4 Wireframe Screen 7) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9BA1A6] print:text-gray-600">
            Top Issues Requiring Immediate CA / Vendor Follow-up
          </h3>

          <div className="space-y-2.5">
            {topIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 rounded-xl border border-[#232B36] bg-[#151B26] print:bg-white print:border-gray-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-white print:text-black flex items-center gap-2">
                    <span>{issue.icon}</span>
                    <span>{issue.title}</span>
                  </div>
                  <p className="text-[#9BA1A6] print:text-gray-600 mt-0.5 ml-6">
                    {issue.summary}
                  </p>
                </div>
                <div className="ml-6 sm:ml-0 font-mono font-bold text-[#F31260] print:text-red-600 flex-shrink-0">
                  {issue.impact}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs text-[#3B82F6] flex items-center gap-2 print:text-blue-700 print:border-blue-200">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>
              💡 <strong>Unclaimed Credit Opportunity:</strong> Global Cable Corp (INV-208) has uploaded ₹8,500 ITC in 2B that is missing from your purchase register. Record it to claim savings!
            </span>
          </div>
        </div>

        {/* Period Totals Table (§9.4 Wireframe Screen 7) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9BA1A6] print:text-gray-600">
            Tax Triangle Audit & Liability Breakdown
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#232B36] print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0E14] text-[#9BA1A6] print:bg-gray-100 print:text-black uppercase text-[10px] tracking-wider border-b border-[#232B36] print:border-gray-300">
                <tr>
                  <th className="py-2.5 px-4">Metric / Table</th>
                  <th className="py-2.5 px-4">Statutory Source</th>
                  <th className="py-2.5 px-4 text-right">Taxable Value (₹)</th>
                  <th className="py-2.5 px-4 text-right">Tax Amount (₹)</th>
                  <th className="py-2.5 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232B36] print:divide-gray-200">
                <tr className="hover:bg-[#161B22] print:bg-transparent">
                  <td className="py-2.5 px-4 font-bold text-white print:text-black">
                    Outward Supplies (GSTR-1)
                  </td>
                  <td className="py-2.5 px-4 text-[#9BA1A6] print:text-gray-600">
                    24 Sales Invoices
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-white print:text-black">
                    ₹8,42,000
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-white print:text-black">
                    ₹1,51,560
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant="emerald" dot className="text-[10px]">
                      Match ✓
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-[#161B22] print:bg-transparent">
                  <td className="py-2.5 px-4 font-bold text-white print:text-black">
                    Inward Supplies (GSTR-2B)
                  </td>
                  <td className="py-2.5 px-4 text-[#9BA1A6] print:text-gray-600">
                    42 Supplier Bills
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-white print:text-black">
                    ₹7,90,555
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#17C964] print:text-green-700">
                    ₹1,42,300
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant="emerald" dot className="text-[10px]">
                      Portal 2B ✓
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-[#161B22] print:bg-transparent">
                  <td className="py-2.5 px-4 font-bold text-white print:text-black">
                    Monthly Return (GSTR-3B)
                  </td>
                  <td className="py-2.5 px-4 text-[#9BA1A6] print:text-gray-600">
                    Tax Paid / Claimed
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-white print:text-black">
                    ₹8,42,000
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#F31260] print:text-red-700">
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
        <div className="pt-4 border-t border-[#232B36] print:border-gray-300 text-[11px] text-[#9BA1A6] print:text-gray-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>&ldquo;A gap is a question, not a verdict. Review the possible causes before deciding.&rdquo;</span>
          <span>ZeroGap · Team JalebiJS · AI Builder Cup 2026</span>
        </div>
      </Card>
    </div>
  );
}
