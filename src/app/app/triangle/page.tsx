'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Edit3,
  Check,
  X,
  Square,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';

interface LegitimateCause {
  id: string;
  text: string;
  checked: boolean;
  explanation: string;
}

export default function TrianglePage() {
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';

  // Three Giant Numbers state
  const [gstr1Liability] = useState<number>(CONFIG.demo.salesTax); // 151560
  const [gstr2bCredit] = useState<number>(CONFIG.demo.itcAvailable2B); // 142300
  const [gstr3bTaxPaid, setGstr3bTaxPaid] = useState<number>(CONFIG.demo.taxPaid3B); // 151560
  const [gstr3bItcClaimed, setGstr3bItcClaimed] = useState<number>(144600); // 142300 + 2300 gap

  // Editable 3B inputs state
  const [isEditing3B, setIsEditing3B] = useState<boolean>(false);
  const [editTaxPaidInput, setEditTaxPaidInput] = useState<string>('151560');
  const [editItcClaimedInput, setEditItcClaimedInput] = useState<string>('144600');

  // Checkbox causes state
  const [salesCauses, setSalesCauses] = useState<LegitimateCause[]>([
    {
      id: 's1',
      text: isHi
        ? '3B में जारी किया गया क्रेडिट नोट, अगले महीने के GSTR-1 में समायोजित होगा'
        : 'Credit note issued in 3B, will adjust in GSTR-1 next month',
      checked: false,
      explanation: isHi
        ? 'क्रेडिट नोट के समायोजन से देनदारी कम होती है।'
        : 'Reductions in outward liability adjust in subsequent GSTR-1 filings.',
    },
    {
      id: 's2',
      text: isHi
        ? 'अग्रिम भुगतान (Advance) पर पहले चुकाया गया टैक्स इस महीने समायोजित हुआ'
        : 'Advance payment adjusted in 3B against final invoice',
      checked: false,
      explanation: isHi
        ? 'अग्रिम राशि पर पहले चुकाए गए टैक्स को अंतिम बिल से घटाया जाता है।'
        : 'Advance tax credit applied against the final supply invoice.',
    },
  ]);

  const [creditCauses, setCreditCauses] = useState<LegitimateCause[]>([
    {
      id: 'c1',
      text: isHi
        ? 'सप्लायर ने देर से फाइल किया — अगले महीने 2B में दिखेगा'
        : 'Supplier filed late — will appear next month',
      checked: false,
      explanation: isHi
        ? 'सप्लायर ने कट-ऑफ तारीख के बाद रिटर्न भरा।'
        : 'Uploaded after the 11th/13th deadline; will cycle into next month.',
    },
    {
      id: 'c2',
      text: isHi
        ? 'क्रेडिट नोट अभी खातों में समायोजित नहीं हुआ'
        : 'Credit note not yet adjusted',
      checked: false,
      explanation: isHi
        ? 'सप्लायर का क्रेडिट नोट पोर्टल पर आ गया है पर खातों में बाकी है।'
        : 'Supplier issued credit note before your internal accounting booked it.',
    },
    {
      id: 'c3',
      text: isHi
        ? 'बिल ऑफ एंट्री के तहत आयात क्रेडिट (जो 2B में नहीं आता)'
        : 'Import credit via Bill of Entry (not in 2B)',
      checked: false,
      explanation: isHi
        ? 'कस्टम्स ICEGATE का आयात टैक्स 2B में नहीं आता, इसे वैध रूप से क्लेम किया जा सकता है।'
        : 'ICEGATE customs import credit claimed legitimately via Bill of Entry.',
    },
  ]);

  // Why? modals state
  const [whyModal, setWhyModal] = useState<{
    title: string;
    description: string;
    subtraction: string;
    note: string;
  } | null>(null);

  // Gemini streaming state per check row
  const [streamingSales, setStreamingSales] = useState<boolean>(false);
  const [salesAiText, setSalesAiText] = useState<string>('');
  const [streamingCredit, setStreamingCredit] = useState<boolean>(false);
  const [creditAiText, setCreditAiText] = useState<string>('');

  // Handle 3B save
  const handleSave3BFigures = () => {
    const paid = parseFloat(editTaxPaidInput.replace(/,/g, '')) || 0;
    const itc = parseFloat(editItcClaimedInput.replace(/,/g, '')) || 0;
    setGstr3bTaxPaid(paid);
    setGstr3bItcClaimed(itc);
    setIsEditing3B(false);
    toast.success('GSTR-3B self-assessed figures updated and triangle recalculated');
  };

  // Toggle causes
  const toggleSalesCause = (id: string) => {
    setSalesCauses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const toggleCreditCause = (id: string) => {
    setCreditCauses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  // Stream Gemini plain language explanations
  const handleStreamExplanation = async (type: 'sales' | 'credit') => {
    if (type === 'sales') {
      setStreamingSales(true);
      setSalesAiText('');
    } else {
      setStreamingCredit(true);
      setCreditAiText('');
    }

    try {
      const prompt =
        type === 'sales'
          ? `Explain simply: GSTR-1 outward tax liability is ₹${gstr1Liability} and GSTR-3B tax paid is ₹${gstr3bTaxPaid}. Gap is ₹0. Is this Rule 88C compliant?`
          : `Explain simply: GSTR-2B available ITC is ₹${gstr2bCredit} and GSTR-3B ITC claimed is ₹${gstr3bItcClaimed}. There is a ₹2,300 excess claim. How does Rule 88D DRC-01C apply and what should the business do?`;

      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            type: 'triangle_gap',
            gap: type === 'sales'
              ? Math.abs(gstr1Liability - gstr3bTaxPaid)
              : Math.abs(gstr3bItcClaimed - gstr2bCredit),
            amountAtRisk: type === 'sales'
              ? Math.abs(gstr1Liability - gstr3bTaxPaid)
              : Math.abs(gstr3bItcClaimed - gstr2bCredit),
            lang,
            ruleNotice: type === 'sales' ? 'Rule 88C' : 'Rule 88D / DRC-01C',
            details: prompt,
          },
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error?.message || 'Explain service error');
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
                if (type === 'sales') {
                  setSalesAiText((prev) => prev + parsed.text);
                } else {
                  setCreditAiText((prev) => prev + parsed.text);
                }
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
    } catch (e: any) {
      toast.error('AI explanation failed');
    } finally {
      if (type === 'sales') setStreamingSales(false);
      else setStreamingCredit(false);
    }
  };

  // Differences
  const salesGap = Math.abs(gstr1Liability - gstr3bTaxPaid);
  const isSalesMatch = salesGap <= 1; // within ₹1 tolerance
  const creditGap = gstr3bItcClaimed - gstr2bCredit; // positive means claimed more than 2B

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#9E6400] tracking-wider uppercase">
              Feature 3 · Statutory Triangle Audit
            </span>
            <Badge variant="red" dot className="text-[11px]">
              {isHi ? 'सक्रिय अवधि:' : 'Active Period:'} {CONFIG.demo.periodLabel}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] text-[#111418]">
            {isHi ? 'तीन संख्याएं। शून्य हैरानी।' : 'Three Numbers. Zero Surprises.'}
          </h1>
          <p className="text-sm text-[#5F6B7A] mt-0.5">
            {isHi
              ? 'GSTR-1 देनदारी, 2B इनपुट क्रेडिट और 3B भुगतान की तुलना करें — टैक्स विभाग के नोटिस से पहले।'
              : 'Cross-audit GSTR-1 outward tax liability, GSTR-2B available credit, and GSTR-3B filed figures before payment.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/purchases">
            <Button variant="outline" size="sm" className="text-xs">
              ← {isHi ? 'खरीद मिलान (F2)' : 'Purchases (F2)'}
            </Button>
          </Link>
          <Link href="/app/periods">
            <Button variant="primary" size="sm" className="text-xs font-medium">
              {isHi ? 'अवधि रिपोर्ट (F4) →' : 'Period Trends (F4) →'}
            </Button>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. Three Giant Numbers (§9.4 Wireframe Screen 5)
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: GSTR-1 Tax Liability */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 flex flex-col justify-between hover:border-[#CBD2DE] transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6B7A]">
                [GSTR-1 tax liability]
              </span>
              <Badge variant="emerald" className="text-[10px] px-2 py-0 flex items-center gap-1">
                <Check className="h-3 w-3 stroke-[3]" />
                auto
              </Badge>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-[30px] font-semibold text-[#111418] tracking-tight tabular-nums">
                ₹{gstr1Liability.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-[#5F6B7A] mt-1">
                {isHi ? 'आपकी बिक्री बिलों से निकाला गया' : 'from your sales'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E3E7EE] mt-3 flex items-center justify-between">
            <span className="text-[11px] text-[#5F6B7A]">24 outward invoices</span>
            <button
              type="button"
              onClick={() =>
                setWhyModal({
                  title: 'GSTR-1 Tax Liability (₹1,51,560)',
                  description:
                    'Extracted from 24 outward sales invoices (18 B2B, 1 B2CL, 5 B2CS) processed in Feature 1.',
                  subtraction:
                    'Total Taxable Value (₹8,42,000) × 18% weighted tax rate = ₹1,51,560.',
                  note: 'This figure is compiled into your byte-exact GSTR-1 JSON export.',
                })
              }
              className="text-[11px] text-[#9E6400] hover:underline font-medium cursor-pointer flex items-center gap-1"
            >
              <span>Why?</span>
              <Info className="h-3 w-3 text-[#F5A524]" />
            </button>
          </div>
        </Card>

        {/* Card 2: 2B Credit Available */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 flex flex-col justify-between hover:border-[#CBD2DE] transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6B7A]">
                [2B credit available]
              </span>
              <Badge variant="emerald" className="text-[10px] px-2 py-0 flex items-center gap-1">
                <Check className="h-3 w-3 stroke-[3]" />
                auto
              </Badge>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-[30px] font-semibold text-[#111418] tracking-tight tabular-nums">
                ₹{gstr2bCredit.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-[#5F6B7A] mt-1">
                {isHi ? '2B पोर्टल अपलोड से निकाला गया' : 'from 2B upload'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E3E7EE] mt-3 flex items-center justify-between">
            <span className="text-[11px] text-[#5F6B7A]">42 supplier records</span>
            <button
              type="button"
              onClick={() =>
                setWhyModal({
                  title: 'GSTR-2B Credit Available (₹1,42,300)',
                  description:
                    'Total eligible Input Tax Credit uploaded by registered vendors in your official GSTR-2B download.',
                  subtraction:
                    'Sum of IGST + CGST + SGST from 42 compliant supplier records generated on 14th September.',
                  note: 'Under Section 16(2)(aa), this is the maximum ITC you can claim without automated Rule 88D flags.',
                })
              }
              className="text-[11px] text-[#9E6400] hover:underline font-medium cursor-pointer flex items-center gap-1"
            >
              <span>Why?</span>
              <Info className="h-3 w-3 text-[#F5A524]" />
            </button>
          </div>
        </Card>

        {/* Card 3: 3B figures (with inline edit) */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 flex flex-col justify-between hover:border-[#CBD2DE] transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6B7A]">
                [3B figures]
              </span>
              <button
                type="button"
                onClick={() => setIsEditing3B(!isEditing3B)}
                className="text-[11px] text-[#9E6400] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                {isEditing3B ? 'cancel' : 'edit — auto'}
              </button>
            </div>

            {isEditing3B ? (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="text-[10px] text-[#5F6B7A] uppercase block font-semibold">
                    Tax Paid (₹)
                  </label>
                  <input
                    type="text"
                    value={editTaxPaidInput}
                    onChange={(e) => setEditTaxPaidInput(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-[#E3E7EE] rounded-[10px] px-2.5 py-1 text-xs text-[#111418] font-mono focus:border-[#F5A524] focus:bg-white focus:outline-none"
                    placeholder="151560"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5F6B7A] uppercase block font-semibold">
                    ITC Claimed (₹)
                  </label>
                  <input
                    type="text"
                    value={editItcClaimedInput}
                    onChange={(e) => setEditItcClaimedInput(e.target.value)}
                    className="w-full bg-[#F6F7F9] border border-[#E3E7EE] rounded-[10px] px-2.5 py-1 text-xs text-[#111418] font-mono focus:border-[#F5A524] focus:bg-white focus:outline-none"
                    placeholder="144600"
                  />
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSave3BFigures}
                  className="w-full h-8 text-xs font-medium mt-1 shadow-xs"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Save & Recalculate
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#5F6B7A]">Tax paid:</span>
                  <span className="text-lg font-semibold text-[#111418] tabular-nums">
                    ₹{gstr3bTaxPaid.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#5F6B7A]">ITC claimed:</span>
                  <span className="text-lg font-semibold text-[#F31260] tabular-nums">
                    ₹{gstr3bItcClaimed.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E3E7EE] mt-3 flex items-center justify-between">
            <span className="text-[11px] text-[#5F6B7A]">Source: Monthly 3B</span>
            <button
              type="button"
              onClick={() =>
                setWhyModal({
                  title: 'GSTR-3B Tax Paid & Claimed',
                  description:
                    'These figures come from your monthly self-assessed GSTR-3B tax return.',
                  subtraction: `Tax Paid: ₹${gstr3bTaxPaid.toLocaleString('en-IN')} | ITC Claimed: ₹${gstr3bItcClaimed.toLocaleString('en-IN')}`,
                  note: 'Click (edit) to test what happens if your accountant enters different 3B numbers.',
                })
              }
              className="text-[11px] text-[#9E6400] hover:underline font-medium cursor-pointer flex items-center gap-1"
            >
              <span>Why?</span>
              <Info className="h-3 w-3 text-[#F5A524]" />
            </button>
          </div>
        </Card>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Check Rows (§9.4 Wireframe Screen 5)
      ────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* ROW 1: Sales check */}
        <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E7EE] pb-3 mb-3">
            <div className="flex items-center gap-3">
              {isSalesMatch ? (
                <div className="w-8 h-8 rounded-full bg-[#17C964]/10 border border-[#17C964]/25 flex items-center justify-center text-[#0F8C43]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#F31260]/10 border border-[#F31260]/25 flex items-center justify-center text-[#C70E4E]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-[#111418] flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isSalesMatch ? 'bg-[#17C964]' : 'bg-[#F31260]'}`} />
                  {isHi ? 'बिक्री जांच: GSTR-1 बनाम 3B टैक्स भुगतान' : 'Sales check: GSTR-1 vs 3B tax paid'}
                  <span className="text-[#5F6B7A] font-normal">—</span>
                  <span className={isSalesMatch ? 'text-[#0F8C43] font-medium' : 'text-[#C70E4E] font-medium'}>
                    {isSalesMatch ? 'Match. Gap ₹0' : `Gap: ₹${salesGap.toLocaleString('en-IN')} underpaid`}
                  </span>
                </h3>
                <p className="text-xs text-[#5F6B7A]">
                  {isHi
                    ? 'Rule 88C (DRC-01B नोटिस) के तहत निगरानी: बिक्री देनदारी पूरी तरह से चुकाई गई है।'
                    : 'Audited under Rule 88C (DRC-01B liability notice) — 0 liability gap detected.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setWhyModal({
                    title: 'Sales Check Math',
                    description: 'Comparing GSTR-1 tax liability against GSTR-3B tax paid.',
                    subtraction: `₹${gstr1Liability.toLocaleString('en-IN')} (GSTR-1) − ₹${gstr3bTaxPaid.toLocaleString('en-IN')} (3B Paid) = ₹${salesGap.toLocaleString('en-IN')} Gap`,
                    note: 'Rule 88C triggers an automated DRC-01B notice if GSTR-1 liability exceeds 3B paid by more than 20% or ₹25 lakhs.',
                  })
                }
                className="text-xs text-[#9E6400] hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>Why?</span>
                <Info className="h-3 w-3 text-[#F5A524]" />
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStreamExplanation('sales')}
                disabled={streamingSales}
                className="text-xs border-[#E3E7EE] text-[#5F6B7A] hover:text-[#111418] bg-white flex items-center gap-1.5 cursor-pointer h-8 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#F5A524]" />
                {streamingSales ? 'Thinking...' : 'Explain in simple words'}
              </Button>
            </div>
          </div>

          {/* Streamed Gemini explanation for Sales */}
          {salesAiText && (
            <div className="p-3.5 rounded-[12px] bg-[#FDF6E4] border border-[#F5A524]/30 my-3 text-xs text-[#111418] space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-[#9E6400] font-semibold text-[11px]">
                <Sparkles className="h-3.5 w-3.5" />
                Gemini 2.0 Flash Plain-Language Audit:
              </div>
              <p className="leading-relaxed">{salesAiText}</p>
            </div>
          )}

          {/* Possible causes checklist (if gap existed) */}
          {!isSalesMatch && (
            <div className="mt-3 p-3.5 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE] text-xs">
              <span className="font-semibold text-[#111418] text-[11px] uppercase tracking-wider block mb-2">
                Possible causes (tick what applies):
              </span>
              <div className="space-y-2">
                {salesCauses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => toggleSalesCause(c.id)}
                    className="flex items-start gap-2 cursor-pointer select-none text-[#111418] hover:text-[#9E6400]"
                  >
                    {c.checked ? (
                      <CheckSquare className="h-4 w-4 text-[#17C964] flex-shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-4 w-4 text-[#5F6B7A] flex-shrink-0 mt-0.5" />
                    )}
                    <span className={c.checked ? 'text-[#0F8C43] font-medium' : ''}>
                      {c.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ROW 2: Credit check */}
        <Card className="rounded-[16px] border border-[#F31260]/30 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E7EE] pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F31260]/10 border border-[#F31260]/25 flex items-center justify-center text-[#C70E4E]">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-medium text-sm text-[#111418] flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F31260]" />
                  {isHi ? 'क्रेडिट जांच: 2B उपलब्ध बनाम 3B दावा' : 'Credit check: 2B available vs 3B claimed'}
                </h3>
                <p className="text-xs text-[#C70E4E] font-medium mt-0.5 tabular-nums">
                  Gap: ₹{creditGap.toLocaleString('en-IN')} {isHi ? 'रुपए 2B से अधिक क्लेम किए गए' : 'more claimed than 2B allows'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setWhyModal({
                    title: 'Credit Check Math (₹2,300 Gap)',
                    description: 'Comparing GSTR-3B ITC claimed against GSTR-2B credit available.',
                    subtraction: `₹${gstr3bItcClaimed.toLocaleString('en-IN')} (Claimed in 3B) − ₹${gstr2bCredit.toLocaleString('en-IN')} (2B Available) = ₹${creditGap.toLocaleString('en-IN')} Excess Claimed`,
                    note: 'Under Rule 88D, claiming excess ITC generates a DRC-01C notice requiring response or payment within 7 days.',
                  })
                }
                className="text-xs text-[#9E6400] hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>Why?</span>
                <Info className="h-3 w-3 text-[#F5A524]" />
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStreamExplanation('credit')}
                disabled={streamingCredit}
                className="text-xs border-[#E3E7EE] text-[#5F6B7A] hover:text-[#111418] bg-white flex items-center gap-1.5 cursor-pointer h-8 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#F5A524]" />
                {streamingCredit ? 'Thinking...' : 'Explain in simple words'}
              </Button>
            </div>
          </div>

          {/* Streamed Gemini explanation for Credit */}
          {creditAiText && (
            <div className="p-3.5 rounded-[12px] bg-[#FDF6E4] border border-[#F5A524]/30 my-3 text-xs text-[#111418] space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-[#9E6400] font-semibold text-[11px]">
                <Sparkles className="h-3.5 w-3.5" />
                Gemini 2.0 Flash Plain-Language Audit:
              </div>
              <p className="leading-relaxed">{creditAiText}</p>
            </div>
          )}

          {/* Possible Causes Checklist (§9.4 Wireframe Screen 5) */}
          <div className="p-3.5 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE] text-xs space-y-2.5">
            <span className="font-semibold text-[#111418] text-[11px] uppercase tracking-wider block">
              Possible causes (tick what applies):
            </span>

            <div className="space-y-2">
              {creditCauses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleCreditCause(c.id)}
                  className="flex items-start gap-2.5 cursor-pointer select-none text-[#111418] hover:text-[#9E6400]"
                >
                  {c.checked ? (
                    <CheckSquare className="h-4 w-4 text-[#17C964] flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="h-4 w-4 text-[#5F6B7A] flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className={c.checked ? 'text-[#0F8C43] font-medium' : ''}>
                      {c.text}
                    </span>
                    <span className="text-[11px] text-[#5F6B7A] block mt-0.5">
                      {c.explanation}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Statutory Rule Notice */}
            <div className="pt-2 border-t border-[#E3E7EE] text-[11px] text-[#5F6B7A]">
              Under Rule 88D, selecting a legitimate statutory cause prepares your audit reply documentation before filing.
            </div>
          </div>
        </Card>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Statutory Disclaimer (§9.4 Wireframe — ALWAYS VISIBLE)
      ────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-[14px] bg-[#FDF6E4] border border-[#F5A524]/25 text-xs text-[#9E6400] flex items-center gap-3 shadow-xs">
        <Info className="h-5 w-5 text-[#F5A524] flex-shrink-0" />
        <p className="font-medium italic leading-relaxed">
          &ldquo;{t.common.triangleDisclaimer}&rdquo;
        </p>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-[16px] border border-[#E3E7EE] bg-white shadow-xs">
        <div className="text-xs text-[#5F6B7A]">
          {isHi
            ? 'त्रिकोण जांच पूरी हो गई है। ऐतिहासिक अवधि ट्रेंड्स और GSTR-9 सारांश के लिए आगे बढ़ें।'
            : 'Triangle audit complete. Move to Screen 6 for BigQuery multi-period historical trend analysis.'}
        </div>
        <Link href="/app/periods">
          <Button variant="primary" size="default" className="font-medium shadow-xs">
            {isHi ? 'अवधि रिपोर्ट (F4) देखें →' : 'Proceed to F4 Periods →'}
          </Button>
        </Link>
      </div>

      {/* MODAL: "Why?" Mathematical Subtraction Popover */}
      {whyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E7EE] rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200 text-[#111418]">
            <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-3">
              <h3 className="text-sm font-semibold text-[#111418] flex items-center gap-2">
                <Info className="h-4 w-4 text-[#F5A524]" />
                {whyModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setWhyModal(null)}
                className="text-[#5F6B7A] hover:text-[#111418] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#111418]">
              <p className="text-[#5F6B7A]">{whyModal.description}</p>

              <div className="p-3 rounded-[10px] bg-[#F6F7F9] border border-[#E3E7EE] font-mono text-xs text-[#9E6400] font-semibold">
                {whyModal.subtraction}
              </div>

              <p className="text-[11px] text-[#5F6B7A] italic leading-relaxed">
                {whyModal.note}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setWhyModal(null)}
                className="text-xs font-medium"
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
