'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/LanguageContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { AlertCircle, AlertTriangle, FileText, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportIssue { id: string; severity: 'red' | 'amber'; title: string; impact: string; summary: string; }
interface ReportState {
  salesTxval: number; salesTax: number; salesInvoiceCount: number; itcAvailable: number;
  itcClaimed: number; gstr3bTaxPaid: number; matchScore: number; moneyAtRisk: number;
  gapsCount: number; supplierRecordCount: number; issues: ReportIssue[];
}

const EMPTY_REPORT: ReportState = { salesTxval: 0, salesTax: 0, salesInvoiceCount: 0, itcAvailable: 0, itcClaimed: 0, gstr3bTaxPaid: 0, matchScore: 0, moneyAtRisk: 0, gapsCount: 0, supplierRecordCount: 0, issues: [] };
const DEMO_ISSUES: ReportIssue[] = [
  { id: 'demo-1', severity: 'red', title: 'Sharma Traders · INV-104', impact: '₹10,440 blocked ITC', summary: 'Vendor did not file this invoice in GSTR-1, so the credit is not available in GSTR-2B.' },
  { id: 'demo-2', severity: 'red', title: 'Shiva Industrial Fasteners · INV-119', impact: '₹1,47,600 blocked ITC', summary: 'High-value supplier invoice is missing from GSTR-2B and needs vendor follow-up.' },
  { id: 'demo-3', severity: 'amber', title: 'Apex Industrial Packaging · INV-122', impact: '₹6,300 rate mismatch', summary: 'The tax rate in purchase books differs from the supplier-reported value.' },
];

export default function ReportsPage() {
  const { lang } = useLanguage();
  const { activeBusiness, activeBusinessId, activePeriod, isDemo } = useWorkspace();
  const isHi = lang === 'hi';
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportState>(EMPTY_REPORT);
  const periodLabel = useMemo(() => new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(activePeriod.slice(0, 4)), Number(activePeriod.slice(4, 6)) - 1, 1))), [activePeriod]);
  const generatedTimestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  useEffect(() => {
    const controller = new AbortController();
    async function loadReport() {
      setLoading(true);
      try {
        const query = `bizId=${encodeURIComponent(activeBusinessId)}&period=${encodeURIComponent(activePeriod)}`;
        const responses = await Promise.all([
          fetch(`/api/dashboard?${query}`, { cache: 'no-store', signal: controller.signal }),
          fetch(`/api/reconcile?${query}`, { cache: 'no-store', signal: controller.signal }),
          fetch(`/api/triangle?${query}`, { cache: 'no-store', signal: controller.signal }),
          fetch(`/api/invoices?${query}&kind=sales`, { cache: 'no-store', signal: controller.signal }),
        ]);
        const [dashboard, reco, triangle, invoices] = await Promise.all(responses.map((response) => response.json()));
        if (!responses.every((response) => response.ok)) throw new Error('Could not load all report sources');
        const issues: ReportIssue[] = (reco.items || []).slice(0, 3).map((item: any) => ({
          id: item.id, severity: item.severity === 'red' ? 'red' : 'amber',
          title: `${item.supplierName || 'Supplier'} · ${item.inum || 'Invoice'}`,
          impact: `₹${Number(item.amountAtRisk || 0).toLocaleString('en-IN')} at risk`,
          summary: item.whatHappened || item.causeLabel || 'Reconciliation review required.',
        }));
        setReport({
          salesTxval: Number(dashboard.period?.totals?.salesTxval || invoices.summary?.salesTxval || 0),
          salesTax: Number(triangle.gstr1TaxLiability || 0),
          salesInvoiceCount: Number(triangle.sourceCounts?.salesInvoiceCount || invoices.totalCount || 0),
          itcAvailable: Number(triangle.gstr2bCreditAvailable || 0), itcClaimed: Number(triangle.gstr3bItcClaimed || 0),
          gstr3bTaxPaid: Number(triangle.gstr3bTaxPaid || 0), matchScore: Number(reco.matchScore || 0),
          moneyAtRisk: Number(reco.moneyAtRisk || triangle.moneyAtRisk || 0), gapsCount: Number(triangle.totalGapsCount || 0),
          supplierRecordCount: Number(triangle.sourceCounts?.supplierRecordCount || 0), issues: isDemo && issues.length === 0 ? DEMO_ISSUES : issues,
        });
      } catch (error: any) {
        if (!controller.signal.aborted) { setReport(EMPTY_REPORT); toast.error(error.message || 'Could not load report'); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    loadReport();
    return () => controller.abort();
  }, [activeBusinessId, activePeriod, isDemo]);

  const hasData = isDemo || report.salesInvoiceCount > 0 || report.supplierRecordCount > 0 || report.gstr3bTaxPaid > 0 || report.itcClaimed > 0;
  const creditGap = Math.abs(report.itcClaimed - report.itcAvailable);
  const handleCopy = async () => {
    const issueLines = report.issues.length ? report.issues.map((issue, index) => `${index + 1}. ${issue.title}: ${issue.impact}`).join('\n') : 'No reconciliation issues recorded.';
    const text = `ZeroGap GST Reconciliation Summary\nBusiness: ${activeBusiness?.name || 'Business'}\nGSTIN: ${activeBusiness?.gstin || 'Not provided'}\nPeriod: ${periodLabel}\n\nMatch score: ${report.matchScore}%\nMoney at risk: ₹${report.moneyAtRisk.toLocaleString('en-IN')}\nGSTR-1 tax: ₹${report.salesTax.toLocaleString('en-IN')}\nGSTR-2B ITC: ₹${report.itcAvailable.toLocaleString('en-IN')}\n3B credit gap: ₹${creditGap.toLocaleString('en-IN')}\n\nIssues:\n${issueLines}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); toast.success('Current workspace summary copied'); setTimeout(() => setCopied(false), 2500); }
    catch { toast.error('Clipboard access was blocked by the browser'); }
  };

  return <div className="space-y-6 max-w-[1200px] mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5 print:hidden">
      <div><div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">{isHi ? 'ऑडिट रिपोर्ट्स और क्लाइंट सारांश' : 'Audit Reports & Client Summary'}</span><Badge variant={hasData ? 'emerald' : 'neutral'} dot className="text-[11px]">{loading ? 'Loading' : hasData ? 'Ready to export' : 'No data yet'}</Badge></div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em]">{isHi ? 'मासिक समाधान रिपोर्ट' : 'Monthly Reconciliation Report'}</h1><p className="text-sm text-[#5F6B7A] mt-0.5">Report for the selected business and filing period only.</p></div>
      <div className="flex items-center gap-3"><Button variant="outline" size="sm" onClick={() => window.print()} disabled={!hasData || loading}><Printer className="h-4 w-4" />Download PDF</Button><Button variant="primary" size="sm" onClick={handleCopy} disabled={!hasData || loading}><Share2 className="h-4 w-4" />{copied ? 'Copied' : 'Copy summary'}</Button></div>
    </div>

    {!loading && !hasData ? <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-10 text-center shadow-xs"><FileText className="mx-auto h-9 w-9 text-[#CBD2DE]" /><h2 className="mt-3 text-base font-semibold">No report data for {periodLabel}</h2><p className="mt-1 text-sm text-[#5F6B7A]">Upload sales and GSTR-2B files, run reconciliation, and enter GSTR-3B figures first.</p></Card> :
      <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#E3E7EE] pb-5 gap-4"><div><h2 className="text-xl sm:text-2xl font-semibold">Monthly Reconciliation Summary — {periodLabel}</h2><div className="text-xs text-[#5F6B7A] mt-1 flex flex-wrap gap-x-4"><span>Business: <strong className="text-[#111418]">{activeBusiness?.name || 'Business'}</strong></span><span>GSTIN: <strong className="text-[#111418] font-mono">{activeBusiness?.gstin || 'Not provided'}</strong></span><span>Generated: <strong className="text-[#111418]">{generatedTimestamp}</strong></span></div></div><Badge variant={report.gapsCount > 0 ? 'amber' : 'emerald'} dot>{report.gapsCount > 0 ? 'Review required' : 'No statutory gaps'}</Badge></div>
        <div className="p-4 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE] flex flex-wrap gap-4 text-sm font-semibold"><span className="text-[#F31260]">Money at risk: ₹{report.moneyAtRisk.toLocaleString('en-IN')}</span><span className="text-[#17C964]">Match score: {report.matchScore}%</span><span className="text-[#F5A524]">{report.gapsCount} statutory {report.gapsCount === 1 ? 'gap' : 'gaps'}</span></div>
        <div className="space-y-3"><h3 className="text-xs font-semibold uppercase tracking-wider text-[#5F6B7A]">Issues requiring follow-up</h3>{report.issues.length === 0 ? <p className="rounded-[12px] border border-[#E3E7EE] p-4 text-sm text-[#5F6B7A]">No reconciliation issues recorded.</p> : report.issues.map((issue) => <div key={issue.id} className="p-3.5 rounded-[12px] border border-[#E3E7EE] text-xs flex justify-between gap-3"><div className="flex gap-2.5">{issue.severity === 'red' ? <AlertCircle className="h-4 w-4 text-[#F31260]" /> : <AlertTriangle className="h-4 w-4 text-[#F5A524]" />}<div><strong>{issue.title}</strong><p className="mt-0.5 text-[#5F6B7A]">{issue.summary}</p></div></div><strong className="shrink-0 text-[#F31260]">{issue.impact}</strong></div>)}</div>
        <div className="overflow-x-auto rounded-[12px] border border-[#E3E7EE]"><table className="w-full text-left text-xs"><thead className="bg-[#F6F7F9] text-[#5F6B7A] uppercase text-[11px]"><tr><th className="p-3">Metric</th><th className="p-3">Source</th><th className="p-3 text-right">Taxable Value</th><th className="p-3 text-right">Tax Amount</th></tr></thead><tbody className="divide-y divide-[#E3E7EE]"><tr><td className="p-3 font-semibold">Outward Supplies (GSTR-1)</td><td className="p-3 text-[#5F6B7A]">{report.salesInvoiceCount} sales invoices</td><td className="p-3 text-right">₹{report.salesTxval.toLocaleString('en-IN')}</td><td className="p-3 text-right font-semibold">₹{report.salesTax.toLocaleString('en-IN')}</td></tr><tr><td className="p-3 font-semibold">Inward Supplies (GSTR-2B)</td><td className="p-3 text-[#5F6B7A]">{report.supplierRecordCount} imported records</td><td className="p-3 text-right">—</td><td className="p-3 text-right font-semibold text-[#17C964]">₹{report.itcAvailable.toLocaleString('en-IN')}</td></tr><tr><td className="p-3 font-semibold">Monthly Return (GSTR-3B)</td><td className="p-3 text-[#5F6B7A]">Manually entered filed figures</td><td className="p-3 text-right">Tax paid ₹{report.gstr3bTaxPaid.toLocaleString('en-IN')}</td><td className="p-3 text-right font-semibold">ITC ₹{report.itcClaimed.toLocaleString('en-IN')}</td></tr></tbody></table></div>
        <div className="pt-4 border-t border-[#E3E7EE] text-[11px] text-[#5F6B7A]">“A gap is a question, not a verdict. Review the possible causes before deciding.”</div>
      </Card>}
  </div>;
}
