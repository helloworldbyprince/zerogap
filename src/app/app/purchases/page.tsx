'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
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
  ExternalLink,
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

export default function PurchasesPage() {
  const [purchaseFilesCount, setPurchaseFilesCount] = useState<number>(44);
  const [gstr2bFileName, setGstr2bFileName] = useState<string>('GSTR-2B_September_2026.xlsx');
  const [gstr2bRecordsCount, setGstr2bRecordsCount] = useState<number>(42);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [whyRiskModalOpen, setWhyRiskModalOpen] = useState<boolean>(false);
  const [aiExplainModal, setAiExplainModal] = useState<MismatchCardData | null>(null);
  const [whyCardModal, setWhyCardModal] = useState<MismatchCardData | null>(null);

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
    items: [],
  });

  // Fetch initial results from API
  useEffect(() => {
    async function loadReco() {
      try {
        const res = await fetch(`/api/reconcile?bizId=${CONFIG.demo.businessName}&period=${CONFIG.demo.periodCode}`);
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

      if (res.status === 202) {
        const data = await res.json();
        if (data.result) {
          setResults(data.result);
        }
        toast.success(`Reconciliation complete! Match score: ${data.matchScore}%, ₹${data.moneyAtRisk.toLocaleString('en-IN')} credit at risk.`, {
          duration: 3500,
        });
      } else {
        toast.error('Reconciliation failed. Please try again.');
      }
    } catch (e: any) {
      toast.error('Reconciliation error: ' + (e.message || 'Unknown'));
    } finally {
      setIsMatching(false);
    }
  };

  // Toggle item checklist checkbox
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
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232B36] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">
              Feature 2 · Inward Supplies & Reconciliation
            </span>
            <Badge variant="amber" dot className="text-[11px]">
              Active Period: {CONFIG.demo.periodLabel}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Purchases vs GSTR-2B Matching
          </h1>
          <p className="text-sm text-[#9BA1A6] mt-0.5">
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
            <Button variant="primary" size="sm" className="text-xs font-bold bg-[#F5A524] hover:bg-[#F5A524]/90 text-black">
              Triangle Check (F3) →
            </Button>
          </Link>
        </div>
      </div>

      {/* Two Dropzones (§9.4 Wireframe Screen 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Dropzone: Purchase bills */}
        <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-5 flex flex-col justify-between hover:border-[#F5A524]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/20 flex items-center justify-center text-[#F5A524]">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    1. Purchase Bills
                    <Badge variant="emerald" className="text-[10px] px-2 py-0">Loaded</Badge>
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    Drop vendor bills (PDF / Photo) or review register
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-dashed border-[#232B36] bg-[#0B0E14] text-center my-2">
              <p className="text-xs font-medium text-white">
                ✓ {purchaseFilesCount} purchase invoices loaded for {CONFIG.demo.periodLabel}
              </p>
              <p className="text-[11px] text-[#9BA1A6] mt-0.5">
                Includes Sharma Traders, Aggarwal Ent, Shiva Fasteners, Zenith, etc.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#9BA1A6]">Source: Internal Accounts</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPurchaseFilesCount(44);
                toast.success('44 demo purchase bills loaded in register');
              }}
              className="text-xs h-7 text-[#9BA1A6] hover:text-white"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reload Demo Bills
            </Button>
          </div>
        </Card>

        {/* Right Dropzone: GSTR-2B file */}
        <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-5 flex flex-col justify-between hover:border-[#17C964]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#17C964]/10 border border-[#17C964]/20 flex items-center justify-center text-[#17C964]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    2. GSTR-2B File
                    <Badge variant="emerald" className="text-[10px] px-2 py-0">Active</Badge>
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    Drop portal Excel (.xlsx) or CSV downloaded from GSTN
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-dashed border-[#232B36] bg-[#0B0E14] text-center my-2">
              <p className="text-xs font-medium text-white truncate">
                ✓ {gstr2bFileName}
              </p>
              <p className="text-[11px] text-[#9BA1A6] mt-0.5">
                {gstr2bRecordsCount} inward supplier records parsed & indexed
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#9BA1A6]">Generated on 14th Sep</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGstr2bFileName('GSTR-2B_September_2026.xlsx');
                setGstr2bRecordsCount(42);
                toast.success('Official GSTR-2B Excel loaded');
              }}
              className="text-xs h-7 text-[#9BA1A6] hover:text-white"
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
          className="bg-[#F5A524] hover:bg-[#F5A524]/90 text-black font-extrabold text-sm px-6 py-2.5 rounded-[12px] shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          {isMatching ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Matching Invoices vs GSTR-2B...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 text-black" />
              ( Run match )
            </>
          )}
        </Button>
      </div>

      {/* Results Header (§9.4 Wireframe) */}
      <Card className="rounded-[16px] border border-[#232B36] bg-gradient-to-r from-[#12161F] via-[#151B26] to-[#12161F] p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Match score [ring 94%] */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#1A2029"
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
                <span className="text-xl font-extrabold text-white tracking-tight">
                  {results.matchScore}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#9BA1A6]">
                  Match
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#9BA1A6] uppercase tracking-wider">
                Match score
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Matched {results.matchedCount}/{results.totalBillsCount}
              </div>
              <p className="text-xs text-[#9BA1A6] mt-1">
                41 purchase bills match supplier 2B data within statutory ±₹0.01 tolerance.
              </p>
            </div>
          </div>

          {/* Right: Tax credit at risk ₹1,84,200 (Why? ⓘ) */}
          <div className="border-t md:border-t-0 md:border-l border-[#232B36] pt-4 md:pt-0 md:pl-8 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F31260] uppercase tracking-wider">
                Tax credit at risk
              </span>
              <button
                onClick={() => setWhyRiskModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#F5A524] hover:underline font-semibold cursor-pointer"
              >
                (Why? ⓘ)
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-[#F31260] tracking-tight mt-1">
              ₹{results.moneyAtRisk.toLocaleString('en-IN')}
            </div>

            <p className="text-xs text-[#9BA1A6] mt-1">
              Blocked ITC from unfiled supplier bills and value discrepancies.
            </p>
          </div>
        </div>
      </Card>

      {/* Filter Tabs (§9.4 Wireframe) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#232B36] pb-3 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#F5A524] text-black shadow-sm'
              : 'bg-[#12161F] text-[#9BA1A6] hover:text-white border border-[#232B36]'
          }`}
        >
          All ({results.totalBillsCount})
        </button>

        <button
          onClick={() => setActiveTab('missing_2b')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'missing_2b'
              ? 'bg-[#F31260] text-white shadow-sm'
              : 'bg-[#12161F] text-[#9BA1A6] hover:text-white border border-[#232B36]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F31260]" />
          Missing in 2B ({results.missingIn2BCount})
        </button>

        <button
          onClick={() => setActiveTab('missing_books')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'missing_books'
              ? 'bg-[#3B82F6] text-white shadow-sm'
              : 'bg-[#12161F] text-[#9BA1A6] hover:text-white border border-[#232B36]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          Missing in books ({results.missingInBooksCount})
        </button>

        <button
          onClick={() => setActiveTab('mismatches')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'mismatches'
              ? 'bg-[#F5A524] text-black shadow-sm'
              : 'bg-[#12161F] text-[#9BA1A6] hover:text-white border border-[#232B36]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F5A524]" />
          Mismatches ({results.mismatchesCount})
        </button>
      </div>

      {/* Mismatch Cards List (§9.4 Wireframe) */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-[16px] border border-[#232B36] bg-[#12161F] text-[#9BA1A6]">
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
                className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-5 sm:p-6 transition-all hover:border-[#232B36]/80 shadow-sm"
              >
                {/* Header: Cause Label + Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={badgeVariant} dot className="text-xs font-bold py-1">
                      {item.causeLabel}
                    </Badge>
                  </div>

                  <div className="text-xs text-[#9BA1A6] flex items-center gap-2 font-mono">
                    <span className="text-white font-semibold">{item.supplierName}</span>
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
                  <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#1A2029]">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] block mb-1">
                      What happened
                    </span>
                    <p className="text-[#ECEDEE] leading-relaxed">
                      {item.whatHappened}
                    </p>
                  </div>

                  {/* Section 2: Money involved */}
                  <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#1A2029]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                        Money involved
                      </span>
                      <button
                        onClick={() => setWhyCardModal(item)}
                        className="text-[10px] text-[#F5A524] hover:underline font-semibold cursor-pointer"
                      >
                        (Why? ⓘ)
                      </button>
                    </div>
                    <p className="text-[#ECEDEE] font-medium leading-relaxed">
                      {item.moneyInvolved}
                    </p>
                  </div>

                  {/* Section 3: Why it matters */}
                  <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#1A2029]">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] block mb-1">
                      Why it matters
                    </span>
                    <p className="text-[#9BA1A6] leading-relaxed">
                      {item.whyItMatters}
                    </p>
                  </div>

                  {/* Section 4: What to do */}
                  <div className="bg-[#0B0E14] p-3.5 rounded-xl border border-[#1A2029]">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] block mb-1.5">
                      What to do
                    </span>
                    <div className="space-y-2">
                      {item.actions && item.actions.length > 0 ? (
                        item.actions.map((act) => (
                          <div
                            key={act.id}
                            onClick={() => handleToggleAction(item.id, act.id)}
                            className="flex items-start gap-2 cursor-pointer select-none text-[#ECEDEE] hover:text-white"
                          >
                            {act.checked ? (
                              <CheckSquare className="h-4 w-4 text-[#17C964] flex-shrink-0 mt-0.5" />
                            ) : (
                              <Square className="h-4 w-4 text-[#9BA1A6] flex-shrink-0 mt-0.5" />
                            )}
                            <span className={act.checked ? 'line-through text-[#9BA1A6]' : ''}>
                              {act.text}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#9BA1A6]">No specific action required.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: (Explain in simple words) button */}
                <div className="mt-4 pt-3 border-t border-[#1A2029] flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAiExplainModal(item)}
                    className="text-xs border-[#232B36] hover:border-[#F5A524]/60 text-[#9BA1A6] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#F5A524]" />
                    (Explain in simple words)
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-[16px] border border-[#232B36] bg-[#12161F]">
        <div className="text-xs text-[#9BA1A6]">
          Ready to verify the 3B tax triangle? Move to Screen 5 to reconcile GSTR-1 liability against 3B payments and 2B available credit.
        </div>
        <Link href="/app/triangle">
          <Button className="bg-[#17C964] hover:bg-[#17C964]/90 text-black font-extrabold text-sm px-6 py-2.5 rounded-[12px] shadow-sm flex items-center gap-2 cursor-pointer">
            Proceed to F3 Triangle check →
          </Button>
        </Link>
      </div>

      {/* MODAL 1: Why Risk? Hero explanation */}
      {whyRiskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#232B36] rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#232B36] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="h-4 w-4 text-[#F5A524]" />
                How is ₹1,84,200 Tax Credit at Risk calculated?
              </h3>
              <button
                onClick={() => setWhyRiskModalOpen(false)}
                className="text-[#9BA1A6] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#ECEDEE]">
              <p>
                Under <strong className="text-white">Section 16(2)(aa)</strong> of the CGST Act and <strong className="text-white">Rule 88D</strong>, a buyer can only claim Input Tax Credit (ITC) if the supplier has furnished invoice details in their GSTR-1.
              </p>

              <div className="rounded-xl border border-[#232B36] bg-[#0B0E14] p-3 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-[#F31260]">
                  <span>1. Missing in 2B (3 unfiled bills):</span>
                  <span>+ ₹1,72,440</span>
                </div>
                <div className="pl-3 text-[10px] text-[#9BA1A6] space-y-0.5">
                  <div className="flex justify-between">
                    <span>· Sharma Traders (INV-104)</span>
                    <span>₹10,440</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Aggarwal Enterprises (INV-112)</span>
                    <span>₹14,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Shiva Fasteners (INV-119)</span>
                    <span>₹1,47,600</span>
                  </div>
                </div>

                <div className="flex justify-between text-[#F5A524]">
                  <span>2. Tax Value Mismatches (4 bills):</span>
                  <span>+ ₹11,760</span>
                </div>
                <div className="pl-3 text-[10px] text-[#9BA1A6] space-y-0.5">
                  <div className="flex justify-between">
                    <span>· Super Tech Gears (INV-108)</span>
                    <span>₹3,600</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Premier Electricals (INV-115)</span>
                    <span>₹1,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Apex Industrial Packaging (INV-122)</span>
                    <span>₹6,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>· Zenith Electronics (INV-129)</span>
                    <span>₹60</span>
                  </div>
                </div>

                <div className="border-t border-[#232B36] pt-1.5 flex justify-between font-bold text-white text-xs">
                  <span>Total Tax Credit at Risk:</span>
                  <span className="text-[#F31260]">₹1,84,200</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[11px]">
                💡 <strong>Bonus Opportunity:</strong> You also have 1 bill from Global Cable Corporation (INV-208) with <strong className="text-white">₹8,500</strong> unclaimed ITC in 2B that you haven&apos;t booked yet!
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setWhyRiskModalOpen(false)}
                className="text-xs bg-[#F5A524] text-black font-bold"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Card Specific (Why? ⓘ) */}
      {whyCardModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#232B36] rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232B36] pb-3">
              <h3 className="text-sm font-bold text-white">
                Math breakdown: {whyCardModal.inum}
              </h3>
              <button
                onClick={() => setWhyCardModal(null)}
                className="text-[#9BA1A6] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#ECEDEE]">
              <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-xl bg-[#0B0E14] border border-[#232B36]">
                <div>
                  <span className="text-[10px] text-[#9BA1A6] block uppercase font-mono">Your Books</span>
                  <span className="text-sm font-bold text-white">₹{whyCardModal.booksTax.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-[#9BA1A6] block">Taxable ₹{whyCardModal.booksTxval.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-l border-[#232B36]">
                  <span className="text-[10px] text-[#9BA1A6] block uppercase font-mono">GSTR-2B Portal</span>
                  <span className="text-sm font-bold text-white">₹{whyCardModal.gstr2bTax.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-[#9BA1A6] block">Taxable ₹{whyCardModal.gstr2bTxval.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#9BA1A6]">
                Difference: <strong className="text-[#F31260]">₹{whyCardModal.amountAtRisk.toLocaleString('en-IN')}</strong>. {whyCardModal.whatHappened}
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

      {/* MODAL 3: Explain in Simple Words Preview (Phase 5 placeholder -> Phase 6 Gemini Flash) */}
      {aiExplainModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#232B36] rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232B36] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#F5A524]" />
                <h3 className="text-sm font-bold text-white">
                  Plain-Language Copilot: {aiExplainModal.supplierName} ({aiExplainModal.inum})
                </h3>
              </div>
              <button
                onClick={() => setAiExplainModal(null)}
                className="text-[#9BA1A6] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#ECEDEE]">
              <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#232B36] space-y-2">
                <p className="font-semibold text-white">
                  What does this mean for your business?
                </p>
                <p className="text-[#9BA1A6] leading-relaxed">
                  {aiExplainModal.cause === 'SUPPLIER_NOT_FILED' && (
                    <>
                      You paid {aiExplainModal.supplierName} ₹{aiExplainModal.booksTax.toLocaleString('en-IN')} GST on bill {aiExplainModal.inum}, but they haven&apos;t reported it to the government yet. If you claim this right now, the GST portal will flag a Rule 88D mismatch notice (DRC-01C) against you.
                    </>
                  )}
                  {aiExplainModal.cause === 'VALUE_MISMATCH' && (
                    <>
                      There is a ₹{aiExplainModal.amountAtRisk.toLocaleString('en-IN')} difference between your bill and what the vendor uploaded on the portal. You can only safely claim what appears on the portal (₹{aiExplainModal.gstr2bTax.toLocaleString('en-IN')}) until the vendor corrects their GSTR-1.
                    </>
                  )}
                  {aiExplainModal.cause === 'MISSING_IN_BOOKS' && (
                    <>
                      Good news! {aiExplainModal.supplierName} uploaded an invoice for ₹{aiExplainModal.gstr2bTax.toLocaleString('en-IN')} GST credit, but your accountant has not recorded it. You can record this bill now and save ₹{aiExplainModal.gstr2bTax.toLocaleString('en-IN')} in tax payment.
                    </>
                  )}
                  {aiExplainModal.cause === 'MATCHED' && (
                    <>
                      Everything looks perfect! The invoice number, GSTIN, and tax amounts match the official GST portal data exactly. You can claim 100% of this credit.
                    </>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/20 text-[#F5A524] text-[11px] flex items-start gap-2">
                <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Gemini 2.0 Flash Streaming Copilot:</strong>
                  <p className="text-[#ECEDEE] mt-0.5">
                    In Phase 6, clicking this button activates real-time Vertex AI streaming in plain English or Hindi directly into each card!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAiExplainModal(null)}
                className="text-xs bg-[#F5A524] text-black font-bold"
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
