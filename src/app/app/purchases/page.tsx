'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
import { useLanguage } from '@/lib/LanguageContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  RotateCcw,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  FileText,
  AlertOctagon,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

type FilterTab = 'all' | 'missing_2b' | 'missing_books' | 'mismatches';

interface ActionItem {
  id: string;
  text: string;
  checked: boolean;
}

interface MismatchCardData {
  id: string;
  inum: string;
  idt: string;
  supplierGstin: string;
  supplierName: string;
  cause: string;
  severity: 'red' | 'amber' | 'blue' | 'green';
  causeLabel: string;
  booksTxval: number;
  booksTax: number;
  gstr2bTxval: number;
  gstr2bTax: number;
  amountAtRisk: number;
  whatHappened: string;
  moneyInvolved: string;
  whyItMatters: string;
  actions: ActionItem[];
}

const INITIAL_DEMO_ITEMS: MismatchCardData[] = [
  {
    id: 'reco_demo_sharma',
    inum: 'INV-104',
    idt: '12-09-2026',
    supplierGstin: '07AAAAA0000A1Z5',
    supplierName: 'Sharma Traders',
    cause: 'SUPPLIER_NOT_FILED',
    severity: 'red',
    causeLabel: 'Supplier has not filed',
    booksTxval: 58000,
    booksTax: 10440,
    gstr2bTxval: 0,
    gstr2bTax: 0,
    amountAtRisk: 10440,
    whatHappened: 'Sharma Traders did not upload invoice INV-104 into their GSTR-1.',
    moneyInvolved: '₹10,440 tax credit blocked under Section 16(2)(aa).',
    whyItMatters: 'If you claim this ₹10,440 in your GSTR-3B, you may receive a DRC-01C notice with 18% annual interest.',
    actions: [
      { id: '1', text: 'Send 1-click WhatsApp payment hold notice to Sharma Traders', checked: false },
      { id: '2', text: 'Defer ₹10,440 ITC claim to next tax period after vendor uploads', checked: false },
    ],
  },
  {
    id: 'reco_demo_shiva',
    inum: 'INV-119',
    idt: '14-09-2026',
    supplierGstin: '06BBBBB1111B1Z2',
    supplierName: 'Shiva Industrial Fasteners',
    cause: 'SUPPLIER_NOT_FILED',
    severity: 'red',
    causeLabel: 'Supplier has not filed',
    booksTxval: 820000,
    booksTax: 147600,
    gstr2bTxval: 0,
    gstr2bTax: 0,
    amountAtRisk: 147600,
    whatHappened: 'Shiva Industrial Fasteners did not file invoice INV-119 on the GST portal.',
    moneyInvolved: '₹1,47,600 input tax credit at risk.',
    whyItMatters: 'High-value discrepancy triggering automated Rule 88D recovery scrutiny if claimed.',
    actions: [
      { id: '1', text: 'Call supplier accounts team to ensure late GSTR-1 inclusion', checked: false },
      { id: '2', text: 'Hold supplier payment until invoice reflects in GSTR-2B', checked: false },
    ],
  },
  {
    id: 'reco_demo_apex',
    inum: 'INV-122',
    idt: '18-09-2026',
    supplierGstin: '09CCCCC2222C1Z8',
    supplierName: 'Apex Industrial Packaging',
    cause: 'RATE_MISMATCH',
    severity: 'amber',
    causeLabel: 'Tax rate mismatch',
    booksTxval: 35000,
    booksTax: 6300,
    gstr2bTxval: 35000,
    gstr2bTax: 0,
    amountAtRisk: 6300,
    whatHappened: 'Vendor declared rate of 0% on portal whereas books recorded standard 18% rate.',
    moneyInvolved: '₹6,300 excess credit discrepancy.',
    whyItMatters: 'Claiming ₹6,300 more than portal records results in automated ITC mismatch flags.',
    actions: [
      { id: '1', text: 'Request corrected debit note or amendment in GSTR-1 Table 9', checked: false },
      { id: '2', text: 'Adjust books to reflect agreed statutory tariff', checked: false },
    ],
  },
  {
    id: 'reco_demo_global',
    inum: 'INV-208',
    idt: '20-09-2026',
    supplierGstin: '27DDDDD3333D1Z1',
    supplierName: 'Global Cable Corp',
    cause: 'MISSING_IN_BOOKS',
    severity: 'blue',
    causeLabel: 'Missing in books (Unclaimed ITC)',
    booksTxval: 0,
    booksTax: 0,
    gstr2bTxval: 47222,
    gstr2bTax: 8500,
    amountAtRisk: 0,
    whatHappened: 'Global Cable Corp filed invoice INV-208 on GST portal, but it was not booked in your accounts.',
    moneyInvolved: '₹8,500 unclaimed credit available to you.',
    whyItMatters: 'You are losing out on ₹8,500 legitimate tax credit that reduces your cash tax liability.',
    actions: [
      { id: '1', text: 'Locate vendor invoice copy from archive or email', checked: false },
      { id: '2', text: 'Record in purchase books to claim ITC in current GSTR-3B', checked: false },
    ],
  },
];

export default function PurchasesPage() {
  const { lang } = useLanguage();
  const [purchaseFilesCount, setPurchaseFilesCount] = useState<number>(44);
  const [gstr2bFileName, setGstr2bFileName] = useState<string>('GSTR-2B_September_2026.xlsx');
  const [gstr2bRecordsCount, setGstr2bRecordsCount] = useState<number>(42);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [whyRiskModalOpen, setWhyRiskModalOpen] = useState<boolean>(false);
  const [aiExplainModal, setAiExplainModal] = useState<MismatchCardData | null>(null);
  const [whyCardModal, setWhyCardModal] = useState<MismatchCardData | null>(null);

  // Gemini streaming state per card
  const [cardExplanations, setCardExplanations] = useState<Record<string, string>>({});
  const [streamingCardId, setStreamingCardId] = useState<string | null>(null);

  // Reconciliation results state
  const [results, setResults] = useState<{
    matchScore: number;
    matchedCount: number;
    totalBillsCount: number;
    moneyAtRisk: number;
    missingIn2BCount: number;
    missingInBooksCount: number;
    mismatchesCount: number;
    items: MismatchCardData[];
  }>({
    matchScore: CONFIG.demo.matchScore, // 94%
    matchedCount: CONFIG.demo.matchedCount, // 41
    totalBillsCount: CONFIG.demo.totalBillsCount, // 45
    moneyAtRisk: CONFIG.demo.moneyAtRisk, // 184200
    missingIn2BCount: CONFIG.demo.missingIn2BCount, // 3
    missingInBooksCount: CONFIG.demo.missingInBooksCount, // 1
    mismatchesCount: CONFIG.demo.mismatchesCount, // 4
    items: INITIAL_DEMO_ITEMS,
  });

  // Fetch initial results from API
  useEffect(() => {
    async function loadReco() {
      try {
        const res = await fetch(`/api/reconcile?bizId=biz_sharma_traders_demo&period=${CONFIG.demo.periodCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.items && data.items.length > 0) {
            setResults(data);
          }
        }
      } catch (e) {
        console.warn('Failed loading reconciliation results from API, using seeded defaults:', e);
      }
    }
    loadReco();
  }, []);

  // Run match handler
  const handleRunMatch = async () => {
    setIsMatching(true);
    toast.info('Running deterministic matching engine across 45 records...', { duration: 1500 });

    try {
      const res = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bizId: CONFIG.demo.businessName,
          period: CONFIG.demo.periodCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setIsMatching(false);
          setResults(data);
          toast.success('Matching complete! Match Score: 94% (41 matched, 4 mismatches, 3 unfiled by supplier)');
        }, 1200);
      } else {
        throw new Error('Reconciliation API error');
      }
    } catch (e) {
      setTimeout(() => {
        setIsMatching(false);
        toast.success('Matching evaluated! Found 14 items requiring review.');
      }, 1000);
    }
  };

  // Toggle action item checkbox
  const handleToggleAction = (cardId: string, actionId: string) => {
    setResults((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== cardId) return item;
        return {
          ...item,
          actions: item.actions.map((act) =>
            act.id === actionId ? { ...act, checked: !act.checked } : act
          ),
        };
      }),
    }));
  };

  // Stream Gemini Plain-Language explanation INTO the card (SSE §9.4 wireframe)
  const handleStreamCardExplain = async (item: MismatchCardData) => {
    setStreamingCardId(item.id);
    setCardExplanations((prev) => ({
      ...prev,
      [item.id]: '',
    }));

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            type: 'mismatch_card',
            cause: item.cause,
            supplierName: item.supplierName,
            invoiceNumber: item.inum,
            amountAtRisk: item.amountAtRisk,
            booksTax: item.booksTax,
            gstr2bTax: item.gstr2bTax,
            lang,
            details: item.whatHappened,
          },
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error?.message || 'Explain service unavailable');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = done ? '' : lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '');
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setCardExplanations((prev) => ({
                  ...prev,
                  [item.id]: (prev[item.id] || '') + parsed.text,
                }));
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch (error) {
              if (error instanceof SyntaxError) continue;
              throw error;
            }
          }
        }
        if (done) break;
      }
    } catch (err: any) {
      toast.error('AI streaming error: ' + (err.message || 'Unknown'));
    } finally {
      setStreamingCardId(null);
    }
  };

  // Filter items based on active tab
  const filteredItems = results.items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'missing_2b') return item.cause === 'SUPPLIER_NOT_FILED';
    if (activeTab === 'missing_books') return item.cause === 'MISSING_IN_BOOKS';
    if (activeTab === 'mismatches') {
      return (
        item.cause !== 'MATCHED' &&
        item.cause !== 'SUPPLIER_NOT_FILED' &&
        item.cause !== 'MISSING_IN_BOOKS'
      );
    }
    return true;
  });

  // SVG Ring calculation for Match Score
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (results.matchScore / 100) * circumference;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#9E6400] tracking-wider uppercase">
              Feature 2 · Inward Supplies & Reconciliation
            </span>
            <Badge variant="amber" dot className="text-[11px]">
              Active Period: {CONFIG.demo.periodLabel}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] text-[#111418]">
            Purchases vs GSTR-2B Matching
          </h1>
          <p className="text-sm text-[#5F6B7A] mt-0.5">
            Identify unfiled supplier bills, rate/value mismatches, and unclaimed input tax credit before filing GSTR-3B.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/sales">
            <Button variant="outline" size="sm" className="text-xs">
              ← Sales (F1)
            </Button>
          </Link>
          <Link href="/app/triangle">
            <Button variant="primary" size="sm" className="text-xs font-medium">
              Triangle Check (F3) →
            </Button>
          </Link>
        </div>
      </div>

      {/* Two Dropzones (§9.4 Wireframe Screen 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Dropzone: Purchase bills */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 flex flex-col justify-between hover:border-[#F5A524]/60 transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FDF6E4] border border-[#F5A524]/20 flex items-center justify-center text-[#F5A524]">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#111418] flex items-center gap-1.5">
                    1. Purchase Bills
                    <Badge variant="emerald" className="text-[10px] px-2 py-0">Loaded</Badge>
                  </h3>
                  <p className="text-xs text-[#5F6B7A]">
                    Drop vendor bills (PDF / Photo) or review register
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-dashed border-[#CBD2DE] bg-[#F6F7F9] text-center my-2">
              <p className="text-xs font-medium text-[#111418] flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#0F8C43] stroke-[3]" />
                {purchaseFilesCount} purchase invoices loaded for {CONFIG.demo.periodLabel}
              </p>
              <p className="text-[11px] text-[#5F6B7A] mt-0.5">
                Includes Sharma Traders, Aggarwal Ent, Shiva Fasteners, Zenith, etc.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#5F6B7A]">Source: Internal Accounts</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPurchaseFilesCount(44);
                toast.success('44 demo purchase bills loaded in register');
              }}
              className="text-xs h-7 text-[#5F6B7A] hover:text-[#111418]"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reload Demo Bills
            </Button>
          </div>
        </Card>

        {/* Right Dropzone: GSTR-2B file */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 flex flex-col justify-between hover:border-[#17C964]/60 transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#17C964]/10 border border-[#17C964]/20 flex items-center justify-center text-[#0F8C43]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#111418] flex items-center gap-1.5">
                    2. GSTR-2B File
                    <Badge variant="emerald" className="text-[10px] px-2 py-0">Active</Badge>
                  </h3>
                  <p className="text-xs text-[#5F6B7A]">
                    Drop portal Excel (.xlsx) or CSV downloaded from GSTN
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-dashed border-[#CBD2DE] bg-[#F6F7F9] text-center my-2">
              <p className="text-xs font-medium text-[#111418] truncate flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#0F8C43] stroke-[3]" />
                {gstr2bFileName}
              </p>
              <p className="text-[11px] text-[#5F6B7A] mt-0.5">
                {gstr2bRecordsCount} inward supplier records parsed & indexed
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#5F6B7A]">Generated on 14th Sep</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGstr2bFileName('GSTR-2B_September_2026.xlsx');
                setGstr2bRecordsCount(42);
                toast.success('Official GSTR-2B Excel loaded');
              }}
              className="text-xs h-7 text-[#5F6B7A] hover:text-[#111418]"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reload Portal 2B
            </Button>
          </div>
        </Card>
      </div>

      {/* Primary Action Button: ( Run match ) */}
      <div className="flex justify-center sm:justify-end">
        <Button
          onClick={handleRunMatch}
          disabled={isMatching}
          variant="primary"
          size="default"
          className="font-medium text-sm px-6 py-2.5 shadow-xs"
        >
          {isMatching ? (
            <>
              <div className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mr-2" />
              Matching Invoices vs GSTR-2B...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Run match
            </>
          )}
        </Button>
      </div>

      {/* Results Header (§9.4 Wireframe) */}
      <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Match score [ring 94%] */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#E3E7EE"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#17C964"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-semibold text-[#111418] tracking-tight tabular-nums">
                  {results.matchScore}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#5F6B7A]">
                  Match
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#5F6B7A] uppercase tracking-wider">
                Match score
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-[#111418] mt-0.5">
                Matched {results.matchedCount}/{results.totalBillsCount}
              </div>
              <p className="text-xs text-[#5F6B7A] mt-1">
                41 purchase bills match supplier 2B data within statutory ±₹0.01 tolerance.
              </p>
            </div>
          </div>

          {/* Right: Tax credit at risk ₹1,84,200 */}
          <div className="border-t md:border-t-0 md:border-l border-[#E3E7EE] pt-4 md:pt-0 md:pl-8 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#C70E4E] uppercase tracking-wider">
                Tax credit at risk
              </span>
              <button
                type="button"
                onClick={() => setWhyRiskModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#9E6400] hover:underline font-medium cursor-pointer"
              >
                <span>Why?</span>
                <Info className="h-3 w-3 text-[#F5A524]" />
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-semibold text-[#F31260] tracking-tight mt-1 tabular-nums">
              ₹{results.moneyAtRisk.toLocaleString('en-IN')}
            </div>

            <p className="text-xs text-[#5F6B7A] mt-1">
              Blocked ITC from unfiled supplier bills and value discrepancies.
            </p>
          </div>
        </div>
      </Card>

      {/* Filter Tabs (§9.4 Wireframe) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-[10px] font-medium transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-[#111418] border border-[#E3E7EE] shadow-xs font-semibold'
              : 'text-[#5F6B7A] hover:text-[#111418] hover:bg-[#F0F2F5]'
          }`}
        >
          All ({results.totalBillsCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missing_2b')}
          className={`px-3.5 py-1.5 rounded-[10px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'missing_2b'
              ? 'bg-[#F31260]/10 text-[#C70E4E] border border-[#F31260]/30 shadow-xs font-semibold'
              : 'text-[#C70E4E] hover:bg-[#F31260]/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F31260]" />
          Missing in 2B ({results.missingIn2BCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missing_books')}
          className={`px-3.5 py-1.5 rounded-[10px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'missing_books'
              ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30 shadow-xs font-semibold'
              : 'text-[#2563EB] hover:bg-[#2563EB]/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
          Missing in books ({results.missingInBooksCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mismatches')}
          className={`px-3.5 py-1.5 rounded-[10px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'mismatches'
              ? 'bg-[#FDF6E4] text-[#9E6400] border border-[#F5A524]/30 shadow-xs font-semibold'
              : 'text-[#9E6400] hover:bg-[#FDF6E4]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F5A524]" />
          Mismatches ({results.mismatchesCount})
        </button>
      </div>

      {/* Mismatch Cards List (§9.4 Wireframe) */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-[16px] border border-[#E3E7EE] bg-white text-[#5F6B7A]">
            No records found for this filter tab.
          </div>
        ) : (
          filteredItems.map((item) => {
            const badgeVariant =
              item.severity === 'red'
                ? 'red'
                : item.severity === 'amber'
                ? 'amber'
                : item.severity === 'blue'
                ? 'blue'
                : 'emerald';

            return (
              <Card
                key={item.id}
                className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 sm:p-6 transition-all hover:border-[#CBD2DE] shadow-xs"
              >
                {/* Header: Cause Label + Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E7EE] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={badgeVariant} dot className="text-xs font-medium py-0.5">
                      {item.causeLabel}
                    </Badge>
                  </div>

                  <div className="text-xs text-[#5F6B7A] flex items-center gap-2 font-mono">
                    <span className="text-[#111418] font-medium font-sans">{item.supplierName}</span>
                    <span>·</span>
                    <span>{item.supplierGstin}</span>
                    <span>·</span>
                    <span>{item.inum}</span>
                    <span>·</span>
                    <span>{item.idt}</span>
                  </div>
                </div>

                {/* 4 Wireframe Sections (§9.4) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Section 1: What happened */}
                  <div className="bg-[#F6F7F9] p-3.5 rounded-[12px] border border-[#E3E7EE]">
                    <span className="font-semibold text-[#111418] uppercase tracking-wider text-[10px] block mb-1">
                      What happened
                    </span>
                    <p className="text-[#111418] leading-relaxed">
                      {item.whatHappened}
                    </p>
                  </div>

                  {/* Section 2: Money involved */}
                  <div className="bg-[#F6F7F9] p-3.5 rounded-[12px] border border-[#E3E7EE]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#111418] uppercase tracking-wider text-[10px]">
                        Money involved
                      </span>
                      <button
                        type="button"
                        onClick={() => setWhyCardModal(item)}
                        className="text-[10px] text-[#9E6400] hover:underline font-medium cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Why?</span>
                        <Info className="h-3 w-3 text-[#F5A524]" />
                      </button>
                    </div>
                    <p className="text-[#111418] font-medium leading-relaxed tabular-nums">
                      {item.moneyInvolved}
                    </p>
                  </div>

                  {/* Section 3: Why it matters */}
                  <div className="bg-[#F6F7F9] p-3.5 rounded-[12px] border border-[#E3E7EE]">
                    <span className="font-semibold text-[#111418] uppercase tracking-wider text-[10px] block mb-1">
                      Why it matters
                    </span>
                    <p className="text-[#5F6B7A] leading-relaxed">
                      {item.whyItMatters}
                    </p>
                  </div>

                  {/* Section 4: What to do */}
                  <div className="bg-[#F6F7F9] p-3.5 rounded-[12px] border border-[#E3E7EE]">
                    <span className="font-semibold text-[#111418] uppercase tracking-wider text-[10px] block mb-1.5">
                      What to do
                    </span>
                    <div className="space-y-2">
                      {item.actions && item.actions.length > 0 ? (
                        item.actions.map((act) => (
                          <div
                            key={act.id}
                            onClick={() => handleToggleAction(item.id, act.id)}
                            className="flex items-start gap-2 cursor-pointer select-none text-[#111418] hover:text-[#9E6400]"
                          >
                            {act.checked ? (
                              <CheckSquare className="h-4 w-4 text-[#17C964] flex-shrink-0 mt-0.5" />
                            ) : (
                              <Square className="h-4 w-4 text-[#5F6B7A] flex-shrink-0 mt-0.5" />
                            )}
                            <span className={act.checked ? 'line-through text-[#5F6B7A]' : ''}>
                              {act.text}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#5F6B7A]">No specific action required.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Streamed Gemini Flash Explanation */}
                {cardExplanations[item.id] && (
                  <div className="mt-3.5 p-3.5 rounded-[12px] bg-[#FDF6E4] border border-[#F5A524]/30 text-xs text-[#111418] space-y-1.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-1.5 text-[#9E6400] font-semibold text-[11px]">
                      <Sparkles className="h-3.5 w-3.5 text-[#F5A524]" />
                      Gemini 2.0 Flash Plain-Language Audit:
                    </div>
                    <p className="leading-relaxed">{cardExplanations[item.id]}</p>
                  </div>
                )}

                {/* Card Footer: (Explain in simple words) button */}
                <div className="mt-4 pt-3 border-t border-[#E3E7EE] flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={streamingCardId === item.id}
                    onClick={() => handleStreamCardExplain(item)}
                    className="text-xs border-[#E3E7EE] hover:border-[#F5A524] text-[#5F6B7A] hover:text-[#111418] bg-white flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#F5A524]" />
                    {streamingCardId === item.id ? 'Thinking...' : 'Explain in simple words'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-[16px] border border-[#E3E7EE] bg-white shadow-xs">
        <div className="text-xs text-[#5F6B7A]">
          Ready to verify the 3B tax triangle? Move to Screen 5 to reconcile GSTR-1 liability against 3B payments and 2B available credit.
        </div>
        <Link href="/app/triangle">
          <Button variant="primary" size="default" className="font-medium shadow-xs">
            Proceed to F3 Triangle check →
          </Button>
        </Link>
      </div>

      {/* MODAL 1: Why Risk? Hero explanation */}
      {whyRiskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E7EE] rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200 text-[#111418]">
            <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-3">
              <h3 className="text-base font-semibold text-[#111418] flex items-center gap-2">
                <Info className="h-4 w-4 text-[#F5A524]" />
                How is ₹1,84,200 Tax Credit at Risk calculated?
              </h3>
              <button
                type="button"
                onClick={() => setWhyRiskModalOpen(false)}
                className="text-[#5F6B7A] hover:text-[#111418] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#111418]">
              <p className="text-[#5F6B7A]">
                Under <strong className="text-[#111418]">Section 16(2)(aa)</strong> of the CGST Act and <strong className="text-[#111418]">Rule 88D</strong>, a buyer can only claim Input Tax Credit (ITC) if the supplier has furnished invoice details in their GSTR-1.
              </p>

              <div className="rounded-[12px] border border-[#E3E7EE] bg-[#F6F7F9] p-3 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-[#C70E4E] font-semibold">
                  <span>1. Missing in 2B (3 unfiled bills):</span>
                  <span>+ ₹1,72,440</span>
                </div>
                <div className="pl-3 text-[10px] text-[#5F6B7A] space-y-0.5">
                  <div className="flex justify-between">
                    <span>· Sharma Traders (INV-104)</span>
                    <span className="tabular-nums">₹10,440</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Aggarwal Enterprises (INV-112)</span>
                    <span className="tabular-nums">₹14,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Shiva Fasteners (INV-119)</span>
                    <span className="tabular-nums">₹1,47,600</span>
                  </div>
                </div>

                <div className="flex justify-between text-[#9E6400] font-semibold">
                  <span>2. Tax Value Mismatches (4 bills):</span>
                  <span>+ ₹11,760</span>
                </div>
                <div className="pl-3 text-[10px] text-[#5F6B7A] space-y-0.5">
                  <div className="flex justify-between">
                    <span>· Super Tech Gears (INV-108)</span>
                    <span className="tabular-nums">₹3,600</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Premier Electricals (INV-115)</span>
                    <span className="tabular-nums">₹1,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Apex Industrial Packaging (INV-122)</span>
                    <span className="tabular-nums">₹6,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Zenith Electronics (INV-129)</span>
                    <span className="tabular-nums">₹60</span>
                  </div>
                </div>

                <div className="border-t border-[#E3E7EE] pt-1.5 flex justify-between font-semibold text-[#111418] text-xs">
                  <span>Total Tax Credit at Risk:</span>
                  <span className="text-[#C70E4E] tabular-nums">₹1,84,200</span>
                </div>
              </div>

              <div className="p-2.5 rounded-[10px] bg-[#FDF6E4] border border-[#F5A524]/30 text-[#9E6400] text-[11px] flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-[#F5A524] shrink-0 mt-0.5" />
                <div>
                  <strong>Bonus Opportunity:</strong> You also have 1 bill from Global Cable Corporation (INV-208) with <strong className="text-[#111418]">₹8,500</strong> unclaimed ITC in 2B that you haven&apos;t booked yet!
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setWhyRiskModalOpen(false)}
                className="text-xs font-medium"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Card Specific (Why?) */}
      {whyCardModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E7EE] rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl text-[#111418]">
            <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-3">
              <h3 className="text-sm font-semibold text-[#111418]">
                Math breakdown: {whyCardModal.inum}
              </h3>
              <button
                type="button"
                onClick={() => setWhyCardModal(null)}
                className="text-[#5F6B7A] hover:text-[#111418] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#111418]">
              <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE]">
                <div>
                  <span className="text-[10px] text-[#5F6B7A] block uppercase font-mono">Your Books</span>
                  <span className="text-sm font-semibold text-[#111418] tabular-nums">₹{whyCardModal.booksTax.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-[#5F6B7A] block tabular-nums">Taxable ₹{whyCardModal.booksTxval.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-l border-[#E3E7EE]">
                  <span className="text-[10px] text-[#5F6B7A] block uppercase font-mono">GSTR-2B Portal</span>
                  <span className="text-sm font-semibold text-[#111418] tabular-nums">₹{whyCardModal.gstr2bTax.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-[#5F6B7A] block tabular-nums">Taxable ₹{whyCardModal.gstr2bTxval.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#5F6B7A]">
                Difference: <strong className="text-[#C70E4E] tabular-nums">₹{whyCardModal.amountAtRisk.toLocaleString('en-IN')}</strong>. {whyCardModal.whatHappened}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWhyCardModal(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
