'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CONFIG } from '@/lib/config';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Search,
  Filter,
  Check,
  Edit2,
  X,
  FileText,
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface InvoiceRecord {
  id: string;
  bizId: string;
  period: string;
  kind: 'sales' | 'purchase';
  inum: string;
  idt: string;
  ctin: string;
  ctinName: string;
  pos: string;
  section: 'B2B' | 'B2CL' | 'B2CS';
  items: Array<{
    num: number;
    hsn: string;
    desc: string;
    qty: number;
    uqc: string;
    txval: number;
    rt: number;
    iamt: number;
    camt: number;
    samt: number;
    csamt: number;
  }>;
  totals: {
    txval: number;
    iamt: number;
    camt: number;
    samt: number;
    csamt: number;
    totalTax: number;
    grandTotal: number;
  };
  status: 'green' | 'amber' | 'red';
  flag?: {
    code: string;
    pillLabel: string;
    message: string;
  } | null;
  flags?: Array<{
    code: string;
    pillLabel: string;
    message: string;
    severity?: string;
  }>;
  docAiConfidence?: number;
  confidences?: Record<string, number>;
  correctedByUser?: boolean;
  confirmed?: boolean;
  source?: {
    filename?: string;
    docAiConfidence?: number;
    parsedVia?: string;
  };
}

interface SummaryData {
  totalBills: number;
  salesTxval: number;
  salesTax: number;
  b2bCount: number;
  b2clCount: number;
  b2csCount: number;
  flagCount: number;
  redCount: number;
  amberCount: number;
  greenCount: number;
}

interface InvoiceReviewTableProps {
  onProceedToGstr1?: () => void;
  bizId?: string;
  period?: string;
}

export function InvoiceReviewTable({
  onProceedToGstr1,
  bizId = 'biz_sharma_traders_demo',
  period = CONFIG.demo.periodCode,
}: InvoiceReviewTableProps) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'B2B' | 'B2CL' | 'B2CS' | 'FLAGS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [acknowledgedRedRows, setAcknowledgedRedRows] = useState(false);

  // Editable Drawer State
  const [drawerForm, setDrawerForm] = useState({
    inum: '',
    idt: '',
    ctin: '',
    ctinName: '',
    hsn: '',
    txval: 0,
    rt: 18,
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices?bizId=${bizId}&period=${period}&kind=sales`);
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
        setSummary(data.summary);
      }
    } catch (e: any) {
      toast.error('Failed to load invoice list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [bizId, period]);

  const handleRowClick = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    const itm = inv.items?.[0] || { hsn: '8471', txval: inv.totals?.txval || 0, rt: 18 };
    setDrawerForm({
      inum: inv.inum,
      idt: inv.idt,
      ctin: inv.ctin || '',
      ctinName: inv.ctinName || '',
      hsn: itm.hsn,
      txval: itm.txval,
      rt: itm.rt,
    });
    setDrawerOpen(true);
  };

  const handleSaveDrawerCorrection = async () => {
    if (!selectedInvoice) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drawerForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to save invoice');
      }

      toast.success(`Updated ${drawerForm.inum} — re-validation complete`);

      // Update in local state optimistically
      const updatedInv = data.invoice;
      setInvoices((prev) => prev.map((item) => (item.id === updatedInv.id ? updatedInv : item)));
      setSelectedInvoice(updatedInv);

      // Refresh overall summary
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Error updating invoice');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmAllGreen = async () => {
    try {
      const res = await fetch('/api/invoices/confirm-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizId, period }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Confirmed all verified rows');
        setInvoices((prev) =>
          prev.map((inv) => (inv.status === 'green' ? { ...inv, confirmed: true } : inv))
        );
      }
    } catch (e: any) {
      toast.error('Bulk confirmation failed');
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    // Tab filter
    if (activeTab === 'B2B' && inv.section !== 'B2B') return false;
    if (activeTab === 'B2CL' && inv.section !== 'B2CL') return false;
    if (activeTab === 'B2CS' && inv.section !== 'B2CS') return false;
    if (activeTab === 'FLAGS' && inv.status === 'green') return false;

    // Search query
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const matchInum = inv.inum.toLowerCase().includes(query);
      const matchName = (inv.ctinName || '').toLowerCase().includes(query);
      const matchGstin = (inv.ctin || '').toLowerCase().includes(query);
      const matchHsn = (inv.items?.[0]?.hsn || '').includes(query);
      return matchInum || matchName || matchGstin || matchHsn;
    }

    return true;
  });

  const redInvoicesCount = invoices.filter((inv) => inv.status === 'red').length;
  const canProceed = redInvoicesCount === 0 || acknowledgedRedRows;

  return (
    <TooltipProvider>
      <div className="w-full space-y-5">
        {/* §9.4 Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[12px] bg-[#161B22] border border-[#232B36] text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#ECEDEE]">
            <span className="font-semibold text-white">
              {summary?.totalBills ?? invoices.length} bills
            </span>
            <span className="text-[#9BA1A6]">·</span>
            <span>
              Taxable{' '}
              <strong className="text-white">
                ₹{(summary?.salesTxval ?? 842000).toLocaleString('en-IN')}
              </strong>
            </span>
            <span className="text-[#9BA1A6]">·</span>
            <span>
              Tax{' '}
              <strong className="text-white">
                ₹{(summary?.salesTax ?? 151560).toLocaleString('en-IN')}
              </strong>
            </span>
            <span className="text-[#9BA1A6]">·</span>
            <span className="text-[#9BA1A6]">
              B2B <strong className="text-[#ECEDEE]">{summary?.b2bCount ?? 18}</strong>
            </span>
            <span className="text-[#9BA1A6]">·</span>
            <span className="text-[#9BA1A6]">
              B2CL <strong className="text-[#ECEDEE]">{summary?.b2clCount ?? 1}</strong>
            </span>
            <span className="text-[#9BA1A6]">·</span>
            <span className="text-[#9BA1A6]">
              B2CS <strong className="text-[#ECEDEE]">{summary?.b2csCount ?? 5}</strong>
            </span>
            <span className="text-[#9BA1A6]">·</span>
            <span className="flex items-center gap-1 font-medium text-[#F5A524]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {summary?.flagCount ?? 3} flags
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConfirmAllGreen}
              className="text-xs h-8 border-[#17C964]/30 text-[#17C964] hover:bg-[#17C964]/10 shrink-0"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Confirm all green rows
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchInvoices}
              className="h-8 px-2 text-[#9BA1A6] hover:text-white"
              title="Refresh table"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors shrink-0',
                activeTab === 'ALL'
                  ? 'bg-[#1A2029] text-white border border-[#232B36]'
                  : 'text-[#9BA1A6] hover:text-[#ECEDEE]'
              )}
            >
              All ({invoices.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('B2B')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors shrink-0',
                activeTab === 'B2B'
                  ? 'bg-[#1A2029] text-white border border-[#232B36]'
                  : 'text-[#9BA1A6] hover:text-[#ECEDEE]'
              )}
            >
              B2B ({summary?.b2bCount ?? 18})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('B2CL')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors shrink-0',
                activeTab === 'B2CL'
                  ? 'bg-[#1A2029] text-white border border-[#232B36]'
                  : 'text-[#9BA1A6] hover:text-[#ECEDEE]'
              )}
            >
              B2C Large ({summary?.b2clCount ?? 1})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('B2CS')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors shrink-0',
                activeTab === 'B2CS'
                  ? 'bg-[#1A2029] text-white border border-[#232B36]'
                  : 'text-[#9BA1A6] hover:text-[#ECEDEE]'
              )}
            >
              B2C Small ({summary?.b2csCount ?? 5})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FLAGS')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0',
                activeTab === 'FLAGS'
                  ? 'bg-[#F5A524]/15 text-[#F5A524] border border-[#F5A524]/30'
                  : 'text-[#F5A524] hover:bg-[#F5A524]/10'
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              Needs Review ({summary?.flagCount ?? 3})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9BA1A6]" />
            <input
              type="text"
              placeholder="Search bill no, customer, HSN…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-[8px] bg-[#11141A] border border-[#232B36] text-xs text-[#ECEDEE] placeholder:text-[#9BA1A6] focus:outline-none focus:border-[#F5A524]"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-[16px] border border-[#232B36] bg-[#11141A] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#232B36] bg-[#161B22]/80 text-[#9BA1A6] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Bill no.</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">GSTIN</th>
                  <th className="py-3 px-3">HSN</th>
                  <th className="py-3 px-3 text-right">Taxable (₹)</th>
                  <th className="py-3 px-3 text-center">Rate</th>
                  <th className="py-3 px-3 text-right">Tax (₹)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232B36]">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#9BA1A6]">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#F5A524]" />
                      Loading invoice records…
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#9BA1A6]">
                      No invoices match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const firstItem = inv.items?.[0] || {
                      hsn: '8471',
                      rt: 18,
                      txval: inv.totals?.txval || 0,
                    };

                    const hasRateMismatch =
                      inv.status === 'amber' ||
                      inv.flag?.code === 'RATE_MISMATCH' ||
                      inv.flags?.some((f) => f.code === 'RATE_MISMATCH');

                    const hasHsnIssue =
                      inv.flag?.code === 'HSN_INVALID_DIGITS' ||
                      inv.flags?.some((f) => f.code === 'HSN_INVALID_DIGITS');

                    const hasGstinIssue =
                      inv.flag?.code === 'GSTIN_INVALID' ||
                      inv.flags?.some((f) => f.code === 'GSTIN_INVALID');

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => handleRowClick(inv)}
                        className={cn(
                          'hover:bg-[#161B22] transition-colors cursor-pointer group',
                          inv.status === 'red' && 'bg-[#F31260]/5',
                          inv.status === 'amber' && 'bg-[#F5A524]/5'
                        )}
                      >
                        {/* Bill No */}
                        <td className="py-3 px-4 font-mono font-medium text-white flex items-center gap-1.5">
                          <span>{inv.inum}</span>
                          {inv.correctedByUser && (
                            <Badge variant="blue" className="text-[9px] px-1 py-0">
                              Edited
                            </Badge>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-[#ECEDEE] whitespace-nowrap">
                          {inv.idt}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4 text-[#ECEDEE] max-w-[180px] truncate">
                          {inv.ctinName || (
                            <span className="text-[#9BA1A6] italic">Unregistered consumer</span>
                          )}
                        </td>

                        {/* GSTIN */}
                        <td className="py-3 px-3 font-mono">
                          {inv.section === 'B2B' ? (
                            hasGstinIssue ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#F31260]/20 text-[#F31260] border border-[#F31260]/40">
                                    GSTIN?
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {inv.flag?.message || 'Invalid GSTIN format — blocks GSTR-1 export'}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-[#17C964] flex items-center gap-1">
                                <Check className="h-3 w-3 stroke-[3]" />
                                <span className="text-[11px] text-[#9BA1A6]">
                                  {inv.ctin ? `${inv.ctin.substring(0, 2)}...` : '✓'}
                                </span>
                              </span>
                            )
                          ) : (
                            <span className="text-[#9BA1A6] text-[11px]">
                              {inv.section}
                            </span>
                          )}
                        </td>

                        {/* HSN */}
                        <td className="py-3 px-3 font-mono">
                          {hasHsnIssue ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#F31260]/20 text-[#F31260] border border-[#F31260]/40">
                                  {firstItem.hsn || 'MISSING'} HSN?
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {inv.flag?.message || 'HSN has fewer digits than required for business turnover'}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-[#ECEDEE]">{firstItem.hsn || '8471'}</span>
                          )}
                        </td>

                        {/* Taxable */}
                        <td className="py-3 px-3 text-right font-medium text-white">
                          ₹{inv.totals?.txval.toLocaleString('en-IN')}
                        </td>

                        {/* Rate */}
                        <td className="py-3 px-3 text-center">
                          {hasRateMismatch ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#F5A524]/20 text-[#F5A524] border border-[#F5A524]/40">
                                  {firstItem.rt}% RATE?
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {inv.flag?.message ||
                                  `Billed ${firstItem.rt}%, HSN ${firstItem.hsn} usually 18% — check before filing`}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-[#ECEDEE]">{firstItem.rt}%</span>
                          )}
                        </td>

                        {/* Tax */}
                        <td className="py-3 px-3 text-right font-medium text-[#ECEDEE]">
                          ₹{inv.totals?.totalTax.toLocaleString('en-IN')}
                        </td>

                        {/* Status Light */}
                        <td className="py-3 px-3 text-center">
                          {inv.status === 'green' && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full bg-[#17C964] shadow-[0_0_8px_rgba(23,201,100,0.6)]"
                              title="Verified & Ready"
                            />
                          )}
                          {inv.status === 'amber' && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full bg-[#F5A524] shadow-[0_0_8px_rgba(245,165,36,0.6)]"
                              title="Advisory Warning"
                            />
                          )}
                          {inv.status === 'red' && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full bg-[#F31260] shadow-[0_0_8px_rgba(243,18,96,0.6)]"
                              title="Blocking Error"
                            />
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(inv);
                            }}
                            className="inline-flex items-center gap-1 text-[#F5A524] hover:underline font-medium text-[11px]"
                          >
                            Review
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Gate Footer Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[12px] bg-[#161B22] border border-[#232B36]">
          <div className="flex items-center gap-3">
            {redInvoicesCount > 0 ? (
              <div className="flex items-center gap-2 text-xs text-[#ECEDEE]">
                <AlertOctagon className="h-4 w-4 text-[#F31260] shrink-0" />
                <span>
                  Fix the{' '}
                  <strong className="text-[#F31260] font-semibold">
                    {redInvoicesCount} red rows
                  </strong>{' '}
                  above (or tick 'I have checked') to unlock GSTR-1 preparation.
                </span>
                <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-[#F5A524]">
                  <input
                    type="checkbox"
                    checked={acknowledgedRedRows}
                    onChange={(e) => setAcknowledgedRedRows(e.target.checked)}
                    className="rounded border-[#232B36] text-[#F5A524] focus:ring-0"
                  />
                  <span className="text-[11px]">I have checked</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#17C964]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>All {invoices.length} invoices verified. Ready to compile GSTR-1.</span>
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={onProceedToGstr1}
            disabled={!canProceed}
            className={cn(
              'font-semibold text-xs sm:text-sm px-5 py-2 shrink-0 transition-all',
              canProceed
                ? 'bg-[#F5A524] hover:bg-[#D98E18] text-black shadow-md cursor-pointer'
                : 'bg-[#232B36] text-[#9BA1A6] cursor-not-allowed'
            )}
          >
            Generate GSTR-1 →
          </Button>
        </div>

        {/* §9.4 Review Drawer (Right Slide-over Panel) */}
        {drawerOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
            <div className="relative w-full max-w-2xl bg-[#0D1017] border-l border-[#232B36] h-full shadow-2xl flex flex-col overflow-hidden">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#232B36] bg-[#11141A]">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span>Invoice {selectedInvoice.inum}</span>
                    <Badge
                      variant={
                        selectedInvoice.status === 'green'
                          ? 'emerald'
                          : selectedInvoice.status === 'amber'
                          ? 'amber'
                          : 'red'
                      }
                      dot
                      className="text-xs"
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    Parsed via Document AI asia-south1 · Confidence:{' '}
                    <strong className="text-white">
                      {((selectedInvoice.docAiConfidence || 0.95) * 100).toFixed(0)}%
                    </strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-[#9BA1A6] hover:bg-[#1A2029] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Visual Document Mock Preview */}
                <div className="rounded-[12px] border border-[#232B36] bg-[#161B22] p-4 text-xs font-mono text-[#9BA1A6] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#232B36] pb-2 text-[11px] text-[#ECEDEE]">
                    <span className="font-sans font-medium flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-[#F5A524]" />
                      Original Document Scan Preview
                    </span>
                    <span className="text-[10px] text-[#9BA1A6]">
                      {selectedInvoice.source?.filename || `${selectedInvoice.inum}.pdf`}
                    </span>
                  </div>

                  {/* Simulated Bill Layout with Bounding Boxes */}
                  <div className="p-3 rounded bg-[#0D1017] border border-[#232B36] space-y-2 text-[11px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">SHARMA TRADERS</p>
                        <p className="text-[10px] text-[#9BA1A6]">GSTIN: 06ABCDE1234F1Z5 · Haryana</p>
                      </div>
                      <div className="text-right border border-[#17C964]/40 bg-[#17C964]/10 px-2 py-0.5 rounded">
                        <span className="text-[#17C964] font-semibold">{selectedInvoice.inum}</span>
                        <div className="text-[9px] text-[#9BA1A6]">{selectedInvoice.idt}</div>
                      </div>
                    </div>

                    <div className="border-t border-[#232B36] pt-2">
                      <div className="text-[10px] text-[#9BA1A6]">Billed To:</div>
                      <div className="text-white font-medium">{drawerForm.ctinName || 'Walk-in Retail'}</div>
                      <div
                        className={cn(
                          'text-[10px] font-mono mt-0.5 px-1.5 py-0.5 rounded inline-block',
                          drawerForm.ctin
                            ? 'border border-[#17C964]/30 bg-[#17C964]/10 text-[#17C964]'
                            : 'text-[#9BA1A6]'
                        )}
                      >
                        GSTIN: {drawerForm.ctin || 'None (Consumer)'}
                      </div>
                    </div>

                    <div className="border-t border-[#232B36] pt-2 flex justify-between items-center text-[10px]">
                      <span>HSN: <strong className="text-white">{drawerForm.hsn}</strong></span>
                      <span>Rate: <strong className="text-white">{drawerForm.rt}%</strong></span>
                      <span>Total: <strong className="text-white">₹{(drawerForm.txval * (1 + drawerForm.rt / 100)).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Flags Warning Box */}
                {selectedInvoice.flags && selectedInvoice.flags.length > 0 && (
                  <div className="p-3.5 rounded-[10px] bg-[#F5A524]/10 border border-[#F5A524]/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#F5A524]">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Review Flags Detected</span>
                    </div>
                    {selectedInvoice.flags.map((flg, idx) => (
                      <p key={idx} className="text-xs text-[#ECEDEE] pl-6">
                        • {flg.message}
                      </p>
                    ))}
                  </div>
                )}

                {/* Form Fields with Confidence Bars */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#9BA1A6]">
                    Extracted Fields & Verification
                  </h4>

                  {/* Bill Number */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label className="text-[#ECEDEE] font-medium">Invoice Number</label>
                      <span className="text-[11px] text-[#17C964]">99% confidence</span>
                    </div>
                    <input
                      type="text"
                      value={drawerForm.inum}
                      onChange={(e) => setDrawerForm({ ...drawerForm, inum: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] bg-[#161B22] border border-[#232B36] text-xs font-mono text-white focus:outline-none focus:border-[#F5A524]"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label className="text-[#ECEDEE] font-medium">Date (DD-MM-YYYY)</label>
                      <span className="text-[11px] text-[#17C964]">98% confidence</span>
                    </div>
                    <input
                      type="text"
                      value={drawerForm.idt}
                      onChange={(e) => setDrawerForm({ ...drawerForm, idt: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] bg-[#161B22] border border-[#232B36] text-xs font-mono text-white focus:outline-none focus:border-[#F5A524]"
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label className="text-[#ECEDEE] font-medium">Customer Name</label>
                      <span className="text-[11px] text-[#17C964]">95% confidence</span>
                    </div>
                    <input
                      type="text"
                      value={drawerForm.ctinName}
                      onChange={(e) => setDrawerForm({ ...drawerForm, ctinName: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] bg-[#161B22] border border-[#232B36] text-xs text-white focus:outline-none focus:border-[#F5A524]"
                    />
                  </div>

                  {/* GSTIN */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label className="text-[#ECEDEE] font-medium">Customer GSTIN</label>
                      <span
                        className={cn(
                          'text-[11px]',
                          selectedInvoice.flag?.code === 'GSTIN_INVALID'
                            ? 'text-[#F31260]'
                            : 'text-[#17C964]'
                        )}
                      >
                        {selectedInvoice.flag?.code === 'GSTIN_INVALID'
                          ? 'Format Mismatch ⚠'
                          : '96% confidence'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={drawerForm.ctin}
                      onChange={(e) =>
                        setDrawerForm({ ...drawerForm, ctin: e.target.value.toUpperCase() })
                      }
                      placeholder="15-digit GSTIN (optional for B2C)"
                      className={cn(
                        'w-full px-3 py-2 rounded-[8px] bg-[#161B22] border text-xs font-mono text-white focus:outline-none',
                        selectedInvoice.flag?.code === 'GSTIN_INVALID'
                          ? 'border-[#F31260] focus:border-[#F31260]'
                          : 'border-[#232B36] focus:border-[#F5A524]'
                      )}
                    />
                  </div>

                  {/* Grid for HSN, Taxable, Rate */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#ECEDEE] font-medium">HSN Code</label>
                      <input
                        type="text"
                        value={drawerForm.hsn}
                        onChange={(e) => setDrawerForm({ ...drawerForm, hsn: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-[8px] bg-[#161B22] border border-[#232B36] text-xs font-mono text-white focus:outline-none focus:border-[#F5A524]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#ECEDEE] font-medium">Taxable (₹)</label>
                      <input
                        type="number"
                        value={drawerForm.txval}
                        onChange={(e) =>
                          setDrawerForm({ ...drawerForm, txval: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-2 rounded-[8px] bg-[#161B22] border border-[#232B36] text-xs font-mono text-white focus:outline-none focus:border-[#F5A524]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#ECEDEE] font-medium">GST Rate %</label>
                      <select
                        value={drawerForm.rt}
                        onChange={(e) =>
                          setDrawerForm({ ...drawerForm, rt: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-2 rounded-[8px] bg-[#161B22] border border-[#232B36] text-xs font-mono text-white focus:outline-none focus:border-[#F5A524]"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Tax Summary in Drawer */}
                  <div className="p-3 rounded-[8px] bg-[#161B22] border border-[#232B36] flex items-center justify-between text-xs">
                    <span className="text-[#9BA1A6]">Calculated Tax:</span>
                    <span className="font-semibold text-white">
                      ₹{Math.round((drawerForm.txval * drawerForm.rt) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#232B36] bg-[#11141A] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(false)}
                  className="border-[#232B36] text-[#9BA1A6] hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveDrawerCorrection}
                  disabled={isUpdating}
                  className="bg-[#F5A524] hover:bg-[#D98E18] text-black font-semibold"
                >
                  {isUpdating ? 'Validating…' : 'Save & Re-validate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
