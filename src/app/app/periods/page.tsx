'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Calendar,
  TrendingUp,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  BarChart3,
  Layers,
  ArrowRight,
  Sparkles,
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
  const isHi = lang === 'hi';
  const [activeTab, setActiveTab] = useState<PeriodTab>('month');

  const [monthlyData, setMonthlyData] = useState<PeriodRow[]>([
    {
      period: '202607',
      periodLabel: 'July 2026',
      salesTax: 124500,
      itcAvailable: 112000,
      itcClaimed: 112000,
      gap: 0,
      status: 'green',
      statusLabel: isHi ? 'सब सही ✓' : 'All clear ✓',
    },
    {
      period: '202608',
      periodLabel: 'August 2026',
      salesTax: 138900,
      itcAvailable: 128400,
      itcClaimed: 129000,
      gap: 600,
      status: 'amber',
      statusLabel: isHi ? 'छोटा अंतर: ₹600' : 'Minor gap: ₹600',
    },
    {
      period: '202609',
      periodLabel: 'September 2026',
      salesTax: CONFIG.demo.salesTax, // 151560
      itcAvailable: CONFIG.demo.itcAvailable2B, // 142300
      itcClaimed: CONFIG.demo.itcAvailable2B + CONFIG.demo.creditCheckGap, // 144600
      gap: CONFIG.demo.creditCheckGap, // 2300
      status: 'red',
      statusLabel: isHi ? 'कार्रवाई आवश्यक: ₹2,300' : 'Action needed: ₹2,300',
    },
  ]);

  // Fetch live from BigQuery rollups API if available
  useEffect(() => {
    async function loadRollups() {
      try {
        const res = await fetch('/api/periods');
        if (res.ok) {
          const data = await res.json();
          if (data.monthly && data.monthly.length > 0) {
            setMonthlyData(data.monthly);
          }
        }
      } catch (e) {
        // Fallback to default realistic 3-month demo data
      }
    }
    loadRollups();
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232B36] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">
              Feature 4 · BigQuery Analytics & Multi-Period Audit
            </span>
            <Badge variant="blue" dot className="text-[11px]">
              {isHi ? 'वित्तीय वर्ष:' : 'Financial Year:'} FY 2026–27
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isHi ? 'महीना, तिमाही, साल — एक नज़र में।' : 'Month, Quarter, Year — One View.'}
          </h1>
          <p className="text-sm text-[#9BA1A6] mt-0.5">
            {isHi
              ? 'BigQuery द्वारा संचालित ऐतिहासिक डेटा। 3 महीनों का टैक्स और इनपुट क्रेडिट ट्रेंड, जो GSTR-9 में काम आता है।'
              : 'Multi-period historical rollups powered by partitioned BigQuery tables. Feeds directly into your annual GSTR-9 filing.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/triangle">
            <Button variant="outline" size="sm" className="text-xs">
              ← {isHi ? 'त्रिकोण जांच (F3)' : 'Triangle (F3)'}
            </Button>
          </Link>
          <Link href="/app/reports">
            <Button variant="primary" size="sm" className="text-xs font-bold bg-[#F5A524] hover:bg-[#F5A524]/90 text-black">
              {isHi ? 'रिपोर्ट्स डाउनलोड करें →' : 'Audit Reports →'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs: [Month] [Quarter] [Year] (§9.4 Wireframe Screen 6) */}
      <div className="flex items-center gap-2 border-b border-[#232B36] pb-3">
        <button
          onClick={() => setActiveTab('month')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'month'
              ? 'bg-[#F5A524] text-black shadow-sm'
              : 'bg-[#12161F] text-[#9BA1A6] hover:text-white border border-[#232B36]'
          }`}
        >
          {isHi ? 'मासिक (Month)' : 'Month'}
        </button>

        <button
          onClick={() => setActiveTab('quarter')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quarter'
              ? 'bg-[#F5A524] text-black shadow-sm'
              : 'bg-[#12161F] text-[#9BA1A6] hover:text-white border border-[#232B36]'
          }`}
        >
          {isHi ? 'तिमाही (Quarter)' : 'Quarter'}
        </button>

        <button
          onClick={() => setActiveTab('year')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'year'
              ? 'bg-[#F5A524] text-black shadow-sm'
              : 'bg-[#12161F] text-[#9BA1A6] hover:text-white border border-[#232B36]'
          }`}
        >
          {isHi ? 'वार्षिक (Year)' : 'Year'}
        </button>
      </div>

      {/* Year Tab Note (§9.4 Wireframe Screen 6) */}
      {activeTab === 'year' && (
        <div className="p-3.5 rounded-[12px] bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs text-[#3B82F6] flex items-center gap-2.5 animate-in fade-in">
          <Info className="h-4 w-4 flex-shrink-0" />
          <p className="font-semibold">
            {isHi
              ? 'यह वार्षिक दृश्य सीधे आपके GSTR-9 वार्षिक रिटर्न में जाता है।'
              : 'This yearly view feeds your GSTR-9 annual return.'}
          </p>
        </div>
      )}

      {/* KPI Row (§9.4 Wireframe Screen 6) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#9BA1A6] block tracking-wider">
            Total sales tax
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            ₹{totalSalesTax.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#9BA1A6] mt-0.5 block">
            Across {monthlyData.length} tax periods
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#9BA1A6] block tracking-wider">
            ITC available
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#17C964] mt-1">
            ₹{totalItcAvailable.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#9BA1A6] mt-0.5 block">
            From official 2B uploads
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#9BA1A6] block tracking-wider">
            ITC claimed
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#F31260] mt-1">
            ₹{totalItcClaimed.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#9BA1A6] mt-0.5 block">
            Self-assessed in 3B
          </span>
        </Card>

        <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#9BA1A6] block tracking-wider">
            Gaps found
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#F5A524] mt-1">
            {totalGapsFound} {totalGapsFound === 1 ? 'gap' : 'gaps'}
          </div>
          <span className="text-[10px] text-[#9BA1A6] mt-0.5 block">
            Monitored by Rule 88D
          </span>
        </Card>
      </div>

      {/* Trend Chart (recharts line chart) (§9.4 Wireframe Screen 6) */}
      <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#232B36] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#F5A524]" />
            <h3 className="font-bold text-sm text-white">
              {isHi
                ? 'टैक्स देनदारी बनाम इनपुट क्रेडिट ट्रेंड (BigQuery)'
                : 'Sales Tax vs ITC Claimed Across Periods'}
            </h3>
          </div>
          <span className="text-[11px] text-[#9BA1A6]">Source: Partitioned BigQuery Rollup</span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232B36" />
              <XAxis dataKey="name" stroke="#9BA1A6" fontSize={11} />
              <YAxis
                stroke="#9BA1A6"
                fontSize={11}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0E14',
                  borderColor: '#232B36',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#fff',
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
      <Card className="rounded-[16px] border border-[#232B36] bg-[#12161F] overflow-hidden shadow-sm">
        <div className="p-4 bg-[#151B26] border-b border-[#232B36] flex items-center justify-between text-xs text-[#9BA1A6]">
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
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
            <thead className="border-b border-[#232B36] text-[#9BA1A6] uppercase text-[10px] tracking-wider bg-[#0B0E14]">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-3 text-right">Sales Tax (₹)</th>
                <th className="py-3 px-3 text-right">ITC Avail (₹)</th>
                <th className="py-3 px-3 text-right">ITC Claimed (₹)</th>
                <th className="py-3 px-3 text-right">Gap (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232B36]">
              {activeTab === 'quarter' ? (
                <tr className="hover:bg-[#161B22]">
                  <td className="py-3 px-4 font-bold text-white">Q2 (Jul – Sep 2026)</td>
                  <td className="py-3 px-3 text-right font-medium text-white">
                    ₹{totalSalesTax.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-[#17C964]">
                    ₹{totalItcAvailable.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-[#F31260]">
                    ₹{totalItcClaimed.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#F5A524]">
                    ₹{(totalItcClaimed - totalItcAvailable).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="amber" dot className="text-[10px]">
                      Quarterly Review
                    </Badge>
                  </td>
                </tr>
              ) : activeTab === 'year' ? (
                <tr className="hover:bg-[#161B22]">
                  <td className="py-3 px-4 font-bold text-white">FY 2026–27 (Year-to-Date)</td>
                  <td className="py-3 px-3 text-right font-medium text-white">
                    ₹{totalSalesTax.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-[#17C964]">
                    ₹{totalItcAvailable.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-[#F31260]">
                    ₹{totalItcClaimed.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#F5A524]">
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
                  <tr key={row.period} className="hover:bg-[#161B22]">
                    <td className="py-3 px-4 font-semibold text-white">{row.periodLabel}</td>
                    <td className="py-3 px-3 text-right font-mono text-white">
                      ₹{row.salesTax.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#17C964]">
                      ₹{row.itcAvailable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#ECEDEE]">
                      ₹{row.itcClaimed.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
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
