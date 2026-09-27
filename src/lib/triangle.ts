import { CONFIG } from './config';

export interface LegitimateCause {
  id: string;
  text: string;
  checked: boolean;
  explanation: string;
}

export interface TriangleGapCheck {
  id: 'sales_check' | 'credit_check';
  title: string;
  status: 'green' | 'amber' | 'red';
  statusLabel: string;
  num1Label: string;
  num1Value: number;
  num2Label: string;
  num2Value: number;
  gap: number;
  isExcess: boolean;
  whyCalculation: string;
  statutoryRule: string;
  possibleCauses: LegitimateCause[];
  explanationPrompt: string;
}

export interface TriangleResult {
  gstr1TaxLiability: number;
  gstr2bCreditAvailable: number;
  gstr3bTaxPaid: number;
  gstr3bItcClaimed: number;
  salesCheck: TriangleGapCheck;
  creditCheck: TriangleGapCheck;
  totalGapsCount: number;
  moneyAtRisk: number;
  disclaimer: string;
  updatedAt: string;
}

export interface TriangleInput {
  gstr1TaxLiability?: number;
  gstr2bCreditAvailable?: number;
  gstr3bTaxPaid?: number;
  gstr3bItcClaimed?: number;
  bizId?: string;
  period?: string;
}

export function computeTriangleAudit(input: TriangleInput = {}): TriangleResult {
  const gstr1Tax =
    input.gstr1TaxLiability !== undefined
      ? input.gstr1TaxLiability
      : CONFIG.demo.salesTax; // ₹1,51,560

  const gstr2bCredit =
    input.gstr2bCreditAvailable !== undefined
      ? input.gstr2bCreditAvailable
      : CONFIG.demo.itcAvailable2B; // ₹1,42,300

  const gstr3bPaid =
    input.gstr3bTaxPaid !== undefined
      ? input.gstr3bTaxPaid
      : CONFIG.demo.taxPaid3B; // ₹1,51,560

  const gstr3bClaimed =
    input.gstr3bItcClaimed !== undefined
      ? input.gstr3bItcClaimed
      : CONFIG.demo.itcAvailable2B + CONFIG.demo.creditCheckGap; // ₹1,44,600 (₹2,300 more than 2B)

  // 1. Sales Check: GSTR-1 vs 3B Tax Paid
  const salesDiff = gstr1Tax - gstr3bPaid;
  const isSalesMatch = Math.abs(salesDiff) <= CONFIG.validation.taxTolerance;

  const salesCheck: TriangleGapCheck = {
    id: 'sales_check',
    title: 'Sales check: GSTR-1 vs 3B tax paid',
    status: isSalesMatch ? 'green' : salesDiff > 0 ? 'red' : 'amber',
    statusLabel: isSalesMatch ? 'Match. Gap ₹0' : `Gap: ₹${Math.abs(salesDiff).toLocaleString('en-IN')}`,
    num1Label: 'GSTR-1 tax liability',
    num1Value: gstr1Tax,
    num2Label: 'GSTR-3B tax paid',
    num2Value: gstr3bPaid,
    gap: Math.abs(salesDiff),
    isExcess: salesDiff > 0,
    whyCalculation: `GSTR-1 liability (₹${gstr1Tax.toLocaleString('en-IN')}) − GSTR-3B tax paid (₹${gstr3bPaid.toLocaleString('en-IN')}) = ₹${Math.abs(salesDiff).toLocaleString('en-IN')}`,
    statutoryRule: 'Monitored under Rule 88C (DRC-01B outward liability notice)',
    possibleCauses: [
      {
        id: 'sales_cause_1',
        text: 'Credit note issued in 3B, to be amended in next month GSTR-1',
        checked: false,
        explanation: 'Reductions in outward liability can be adjusted in subsequent GSTR-1 returns.',
      },
      {
        id: 'sales_cause_2',
        text: 'Advance payment received in earlier period adjusted this month',
        checked: false,
        explanation: 'Tax paid on advances previously is credited against the final tax invoice.',
      },
      {
        id: 'sales_cause_3',
        text: 'Zero-rated export with payment of IGST under customs refund',
        checked: false,
        explanation: 'Export invoices require special shipping bill alignment before matching.',
      },
    ],
    explanationPrompt: `Explain in simple terms the sales check comparison: GSTR-1 liability is ₹${gstr1Tax.toLocaleString('en-IN')} and GSTR-3B tax paid is ₹${gstr3bPaid.toLocaleString('en-IN')}. Is this compliant with GST Rule 88C?`,
  };

  // 2. Credit Check: 2B Available vs 3B Claimed
  const creditDiff = gstr3bClaimed - gstr2bCredit;
  const isCreditMatch = Math.abs(creditDiff) <= CONFIG.validation.taxTolerance;

  const creditCheck: TriangleGapCheck = {
    id: 'credit_check',
    title: 'Credit check: 2B available vs 3B claimed',
    status: isCreditMatch ? 'green' : creditDiff > 0 ? 'red' : 'amber',
    statusLabel: isCreditMatch
      ? 'Match. Gap ₹0'
      : `Gap: ₹${Math.abs(creditDiff).toLocaleString('en-IN')} more claimed than 2B allows`,
    num1Label: 'GSTR-2B credit available',
    num1Value: gstr2bCredit,
    num2Label: 'GSTR-3B ITC claimed',
    num2Value: gstr3bClaimed,
    gap: Math.abs(creditDiff),
    isExcess: creditDiff > 0,
    whyCalculation: `GSTR-3B ITC claimed (₹${gstr3bClaimed.toLocaleString('en-IN')}) − GSTR-2B available (₹${gstr2bCredit.toLocaleString('en-IN')}) = ₹${Math.abs(creditDiff).toLocaleString('en-IN')}`,
    statutoryRule: 'Monitored under Rule 88D (DRC-01C input tax credit notice — 7 days reply window)',
    possibleCauses: [
      {
        id: 'credit_cause_1',
        text: 'Supplier filed late — will appear next month',
        checked: false,
        explanation: 'Supplier uploaded invoice after the 11th/13th deadline; will reflect in subsequent 2B cycle.',
      },
      {
        id: 'credit_cause_2',
        text: 'Credit note not yet adjusted',
        checked: false,
        explanation: 'Supplier credit note reflected on portal before your accounts team booked it.',
      },
      {
        id: 'credit_cause_3',
        text: 'Import credit via Bill of Entry (not in 2B)',
        checked: false,
        explanation: 'ICEGATE customs import tax credits often do not flow into domestic GSTR-2B and are validly claimed via Bill of Entry.',
      },
    ],
    explanationPrompt: `Explain in simple terms why GSTR-3B ITC claimed (₹${gstr3bClaimed.toLocaleString('en-IN')}) exceeds GSTR-2B available (₹${gstr2bCredit.toLocaleString('en-IN')}) by ₹${Math.abs(creditDiff).toLocaleString('en-IN')}. What does Rule 88D / DRC-01C say and what should the business do?`,
  };

  const gapsCount = (isSalesMatch ? 0 : 1) + (isCreditMatch ? 0 : 1);
  const moneyAtRisk = (salesDiff > 0 ? salesDiff : 0) + (creditDiff > 0 ? creditDiff : 0);

  return {
    gstr1TaxLiability: gstr1Tax,
    gstr2bCreditAvailable: gstr2bCredit,
    gstr3bTaxPaid: gstr3bPaid,
    gstr3bItcClaimed: gstr3bClaimed,
    salesCheck,
    creditCheck,
    totalGapsCount: gapsCount,
    moneyAtRisk,
    disclaimer: 'A gap is a question, not a verdict. Review the possible causes before deciding.',
    updatedAt: new Date().toISOString(),
  };
}
