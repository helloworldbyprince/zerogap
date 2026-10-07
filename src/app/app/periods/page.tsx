'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/LanguageContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import {
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type PeriodTab = 'month' | 'quarter' | 'year';

interface PeriodRow {
  period: string;
  periodLabel: string;
  salesTax: number;
  itcAvailable: number;
  itcClaimed: number;
  gap: number;
  status: 'green' | 'amber' | 'red';
  statusLabel: string;
}

export default function PeriodsPage() {
  const { lang } = useLanguage();
  const { activeBusinessId, isDemo } = useWorkspace();
  const isHi = lang === 'hi';
  const [activeTab, setActiveTab] = useState<PeriodTab>('month');

  const [monthlyData, setMonthlyData] = useState<PeriodRow[]>([]);

  // Fetch workspace-isolated historical period summaries.
  useEffect(() => {
    async function loadRollups() {
      try {
        const res = await fetch(`/api/periods?bizId=${encodeURIComponent(activeBusinessId)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setMonthlyData(data.monthly || []);
        }
      } catch (e) {
        setMonthlyData([]);
      }
    }
    loadRollups();
  }, [activeBusinessId]);

  // Compute KPI totals
  const totalSalesTax = monthlyData.reduce((s, r) => s + r.salesTax, 0);
  const totalItcAvailable = monthlyData.reduce((s, r) => s + r.itcAvailable, 0);
  const totalItcClaimed = monthlyData.reduce((s, r) => s + r.itcClaimed, 0);
  const totalGapsFound = monthlyData.filter((r) => r.gap > 0).length;

  // Recharts chart data format
  const chartData = monthlyData.map((m) => ({
    name: m.periodLabel.replace(' 2026', ''),
    'Sales Tax': m.salesTax,
    'ITC Available (2B)': m.itcAvailable,
    'ITC Claimed (3B)': m.itcClaimed,
  }));

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">
              Feature 4 · Period Analytics & Multi-Period Audit
            </span>
            <Badge variant="blue" dot className="text-[11px]">
              {isHi ? 'वित्तीय वर्ष:' : 'Financial Year:'} FY 2026–27
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#111418]">
            {isHi ? 'महीना, तिमाही, साल — एक नज़र में।' : 'Month, Quarter, Year — One View.'}
          </h1>
          <p className="text-sm text-[#5F6B7A] mt-0.5">
            {isHi
              ? 'सहेजी गई अवधियों का टैक्स और इनपुट क्रेडिट ट्रेंड, जो वार्षिक समीक्षा में काम आता है।'
              : isDemo ? 'Synthetic three-month demo trend for exploring annual views.' : 'Historical totals from this business’s saved tax periods. Feeds into annual review.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/triangle">
            <Button variant="outline" size="sm" className="text-xs font-medium border-[#E3E7EE] text-[#111418] hover:bg-[#F6F7F9]">
              ← {isHi ? 'त्रिकोण जांच (F3)' : 'Triangle (F3)'}
            </Button>
          </Link>
          <Link href="/app/reports">
            <Button variant="primary" size="sm" className="text-xs font-medium bg-[#F5A524] hover:bg-[#F5A524]/90 text-[#1A1A1A]">
              {isHi ? 'रिपोर्ट्स देखें →' : 'Audit reports →'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs: [Month] [Quarter] [Year] (§9.4 Wireframe Screen 6) */}
      <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-3">
        <button
          onClick={() => setActiveTab('month')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'month'
              ? 'bg-[#F5A524] text-[#1A1A1A] shadow-xs'
              : 'bg-white text-[#5F6B7A] hover:text-[#111418] border border-[#E3E7EE]'
          }`}
        >
          {isHi ? 'मासिक (Month)' : 'Month'}
        </button>

        <button
          onClick={() => setActiveTab('quarter')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'quarter'
              ? 'bg-[#F5A524] text-[#1A1A1A] shadow-xs'
              : 'bg-white text-[#5F6B7A] hover:text-[#111418] border border-[#E3E7EE]'
          }`}
        >
          {isHi ? 'तिमाही (Quarter)' : 'Quarter'}
        </button>

        <button
          onClick={() => setActiveTab('year')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'year'
              ? 'bg-[#F5A524] text-[#1A1A1A] shadow-xs'
              : 'bg-white text-[#5F6B7A] hover:text-[#111418] border border-[#E3E7EE]'
          }`}
        >
          {isHi ? 'वार्षिक (Year)' : 'Year'}
        </button>
      </div>

      {/* Year Tab Note (§9.4 Wireframe Screen 6) */}
      {activeTab === 'year' && (
        <div className="p-3.5 rounded-[12px] bg-[#FDF6E4] border border-[#F5A524]/30 text-xs text-[#111418] flex items-center gap-2.5 animate-in fade-in">
          <Info className="h-4 w-4 text-[#F5A524] flex-shrink-0" />
          <p className="font-medium">
            {isHi
              ? 'यह वार्षिक दृश्य सीधे आपके GSTR-9 वार्षिक रिटर्न में जाता है।'
              : 'This yearly view feeds your GSTR-9 annual return.'}
          </p>
        </div>
      )}

      {/* KPI Row (§9.4 Wireframe Screen 6) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-4 shadow-xs">
          <span className="text-[11px] uppercase font-medium text-[#5F6B7A] block tracking-wider">
            Total sales tax
          </span>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums text-[#111418] mt-1">
            ₹{totalSalesTax.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#5F6B7A] mt-0.5 block">
            Across {monthlyData.length} tax periods
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-4 shadow-xs">
          <span className="text-[11px] uppercase font-medium text-[#5F6B7A] block tracking-wider">
            ITC available
          </span>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums text-[#17C964] mt-1">
            ₹{totalItcAvailable.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#5F6B7A] mt-0.5 block">
            From official 2B uploads
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-4 shadow-xs">
          <span className="text-[11px] uppercase font-medium text-[#5F6B7A] block tracking-wider">
            ITC claimed
          </span>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums text-[#F31260] mt-1">
            ₹{totalItcClaimed.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#5F6B7A] mt-0.5 block">
            Self-assessed in 3B
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-4 shadow-xs">
          <span className="text-[11px] uppercase font-medium text-[#5F6B7A] block tracking-wider">
            Gaps found
          </span>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums text-[#F5A524] mt-1">
            {totalGapsFound} {totalGapsFound === 1 ? 'gap' : 'gaps'}
          </div>
          <span className="text-[11px] text-[#5F6B7A] mt-0.5 block">
            Monitored by Rule 88D
          </span>
        </Card>
      </div>

      {/* Trend Chart (recharts line chart) (§9.4 Wireframe Screen 6) */}
      <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#F5A524]" />
            <h3 className="font-semibold text-sm text-[#111418]">
              {isHi
                ? 'टैक्स देनदारी बनाम इनपुट क्रेडिट ट्रेंड'
                : 'Sales Tax vs ITC Claimed Across Periods'}
            </h3>
          </div>
          <span className="text-[11px] text-[#5F6B7A]">Source: {isDemo ? 'Synthetic demo rollup' : 'Saved workspace periods'}</span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E7EE" />
              <XAxis dataKey="name" stroke="#5F6B7A" fontSize={11} />
              <YAxis
                stroke="#5F6B7A"
                fontSize={11}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E3E7EE',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#111418',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey="Sales Tax"
                stroke="#F5A524"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#F5A524' }}
              />
              <Line
                type="monotone"
                dataKey="ITC Available (2B)"
                stroke="#17C964"
                strokeWidth={2}
                dot={{ r: 3, fill: '#17C964' }}
              />
              <Line
                type="monotone"
                dataKey="ITC Claimed (3B)"
                stroke="#F31260"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#F31260' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Period Table (§9.4 Wireframe Screen 6) */}
      <Card className="rounded-[16px] border border-[#E3E7EE] bg-white overflow-hidden shadow-xs">
        <div className="p-4 bg-[#F6F7F9] border-b border-[#E3E7EE] flex items-center justify-between text-xs text-[#5F6B7A]">
          <span className="font-semibold text-[#111418] uppercase tracking-wider text-[11px]">
            {activeTab === 'month'
              ? 'Monthly Summary Table'
              : activeTab === 'quarter'
              ? 'Quarterly Rollup (Q2: Jul–Sep 2026)'
              : 'FY 2026–27 Annual Rollup'}
          </span>
          <span>{monthlyData.length} periods tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E3E7EE] text-[#5F6B7A] uppercase text-[11px] font-medium tracking-wider bg-[#F6F7F9]">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-3 text-right">Sales Tax (₹)</th>
                <th className="py-3 px-3 text-right">ITC Avail (₹)</th>
                <th className="py-3 px-3 text-right">ITC Claimed (₹)</th>
                <th className="py-3 px-3 text-right">Gap (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE]">
              {monthlyData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#5F6B7A]">
                    No saved periods for this business yet. Upload data and complete the Triangle Check to create period history.
                  </td>
                </tr>
              ) : activeTab === 'quarter' ? (
                <tr className="hover:bg-[#F6F7F9]">
                  <td className="py-3 px-4 font-semibold text-[#111418]">Q2 (Jul – Sep 2026)</td>
                  <td className="py-3 px-3 text-right font-medium tabular-nums text-[#111418]">
                    ₹{totalSalesTax.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#17C964]">
                    ₹{totalItcAvailable.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#F31260]">
                    ₹{totalItcClaimed.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#F5A524]">
                    ₹{(totalItcClaimed - totalItcAvailable).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="amber" dot className="text-[10px]">
                      Quarterly Review
                    </Badge>
                  </td>
                </tr>
              ) : activeTab === 'year' ? (
                <tr className="hover:bg-[#F6F7F9]">
                  <td className="py-3 px-4 font-semibold text-[#111418]">FY 2026–27 (Year-to-Date)</td>
                  <td className="py-3 px-3 text-right font-medium tabular-nums text-[#111418]">
                    ₹{totalSalesTax.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#17C964]">
                    ₹{totalItcAvailable.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#F31260]">
                    ₹{totalItcClaimed.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#F5A524]">
                    ₹{(totalItcClaimed - totalItcAvailable).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="blue" dot className="text-[10px]">
                      GSTR-9 Ready
                    </Badge>
                  </td>
                </tr>
              ) : (
                monthlyData.map((row) => (
                  <tr key={row.period} className="hover:bg-[#F6F7F9]">
                    <td className="py-3 px-4 font-medium text-[#111418]">{row.periodLabel}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#111418]">
                      ₹{row.salesTax.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#17C964]">
                      ₹{row.itcAvailable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#111418]">
                      ₹{row.itcClaimed.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold">
                      {row.gap > 0 ? (
                        <span className="text-[#F31260]">₹{row.gap.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-[#17C964]">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          row.status === 'green'
                            ? 'emerald'
                            : row.status === 'amber'
                            ? 'amber'
                            : 'red'
                        }
                        dot
                        className="text-[10px]"
                      >
                        {row.statusLabel}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
