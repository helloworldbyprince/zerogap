import { CONFIG } from './config';
import { lookupHsn } from './hsn';

export type ValidationStatus = 'green' | 'amber' | 'red';

export interface InvoiceItem {
  num?: number;
  hsn: string;
  desc?: string;
  qty: number;
  uqc: string;
  txval: number;
  rt: number;
  iamt: number;
  camt: number;
  samt: number;
  csamt?: number;
}

export interface ValidationFlag {
  field: string;
  code: 'GSTIN_INVALID' | 'RATE_MISMATCH' | 'HSN_INVALID_DIGITS' | 'HSN_NOT_FOUND' | 'TAX_MATH_MISMATCH' | 'DATE_INVALID' | 'INUM_MISSING' | 'LOW_CONFIDENCE';
  severity: 'error' | 'warning';
  pillLabel: string; // 'RATE?' | 'HSN?' | 'GSTIN?' | 'MATH?' | 'CONFIDENCE?'
  message: string;
  expected?: any;
  actual?: any;
}

export interface ValidateInvoiceInput {
  inum: string;
  idt: string; // DD-MM-YYYY
  ctin?: string | null;
  section: 'B2B' | 'B2CL' | 'B2CS';
  turnoverSlab?: 'UNDER_5CR' | 'OVER_5CR';
  items: InvoiceItem[];
  totals: {
    txval: number;
    iamt: number;
    camt: number;
    samt: number;
    grandTotal: number;
  };
  confidences?: Record<string, number>;
  docAiConfidence?: number;
  period?: string; // YYYYMM
}

export interface ValidationResult {
  status: ValidationStatus;
  isValid: boolean;
  flags: ValidationFlag[];
  blockingErrorsCount: number;
  warningsCount: number;
}

const GSTIN_REGEX = new RegExp(CONFIG.validation.gstinRegex);

export function validateInvoice(input: ValidateInvoiceInput): ValidationResult {
  const flags: ValidationFlag[] = [];
  const turnoverSlab = input.turnoverSlab || 'UNDER_5CR';
  const minHsnDigits = turnoverSlab === 'OVER_5CR'
    ? CONFIG.validation.hsnDigitsOver5Cr
    : CONFIG.validation.hsnDigitsUnder5Cr;

  // 1. Invoice Number Check
  if (!input.inum || input.inum.trim().length === 0) {
    flags.push({
      field: 'inum',
      code: 'INUM_MISSING',
      severity: 'error',
      pillLabel: 'INUM?',
      message: 'Invoice number is missing or blank',
    });
  }

  // 2. Date Format Check (strictly DD-MM-YYYY)
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const dateMatch = input.idt?.match(dateRegex);
  const parsedDate = dateMatch
    ? new Date(Date.UTC(Number(dateMatch[3]), Number(dateMatch[2]) - 1, Number(dateMatch[1])))
    : null;
  const isRealDate = !!(
    dateMatch &&
    parsedDate &&
    parsedDate.getUTCFullYear() === Number(dateMatch[3]) &&
    parsedDate.getUTCMonth() === Number(dateMatch[2]) - 1 &&
    parsedDate.getUTCDate() === Number(dateMatch[1])
  );
  const invoicePeriod = dateMatch ? `${dateMatch[3]}${dateMatch[2]}` : '';
  if (!isRealDate || (input.period && invoicePeriod !== input.period)) {
    flags.push({
      field: 'idt',
      code: 'DATE_INVALID',
      severity: 'error',
      pillLabel: 'DATE?',
      message: !isRealDate
        ? `Date must be a valid date formatted as DD-MM-YYYY (got "${input.idt || 'empty'}")`
        : `Invoice date ${input.idt} is outside filing period ${input.period}`,
    });
  }

  // 3. GSTIN Check for B2B
  if (input.section === 'B2B') {
    if (!input.ctin || !GSTIN_REGEX.test(input.ctin.trim())) {
      flags.push({
        field: 'ctin',
        code: 'GSTIN_INVALID',
        severity: 'error',
        pillLabel: 'GSTIN?',
        message: input.ctin
          ? `Invalid GSTIN format "${input.ctin}". Must be 15 alphanumeric characters matching GSTN pattern.`
          : 'Customer GSTIN is required for B2B invoices.',
        expected: CONFIG.validation.gstinRegex,
        actual: input.ctin || 'empty',
      });
    }
  }

  // 4. Line Items: HSN and Rate validations
  if (!input.items || input.items.length === 0) {
    flags.push({
      field: 'items',
      code: 'HSN_INVALID_DIGITS',
      severity: 'error',
      pillLabel: 'NO_ITEMS?',
      message: 'Invoice has no line items',
    });
  } else {
    for (const item of input.items) {
      const hsnDigits = (item.hsn || '').replace(/\D/g, '');

      // HSN Digit count check
      if (hsnDigits.length < minHsnDigits || hsnDigits.length > 8 || hsnDigits !== item.hsn) {
        flags.push({
          field: 'hsn',
          code: 'HSN_INVALID_DIGITS',
          severity: 'error',
          pillLabel: 'HSN?',
          message: `HSN must contain ${minHsnDigits}–8 digits for this turnover slab (got "${item.hsn || 'blank'}").`,
          expected: minHsnDigits,
          actual: hsnDigits.length,
        });
      }

      // HSN Master Rate Check
      const masterHsn = lookupHsn(hsnDigits);
      if (masterHsn) {
        if (masterHsn.gstRate !== item.rt) {
          flags.push({
            field: 'rt',
            code: 'RATE_MISMATCH',
            severity: 'warning',
            pillLabel: 'RATE?',
            message: `Billed ${item.rt}%, HSN ${item.hsn} usually ${masterHsn.gstRate}% — check before filing`,
            expected: masterHsn.gstRate,
            actual: item.rt,
          });
        }
      }

      // Tax Arithmetic check per item
      const expectedTax = Math.round(((item.txval * item.rt) / 100) * 100) / 100;
      const actualTax = (item.iamt || 0) + (item.camt || 0) + (item.samt || 0);
      const diff = Math.abs(expectedTax - actualTax);

      if (diff > CONFIG.validation.taxTolerance) {
        flags.push({
          field: 'txval',
          code: 'TAX_MATH_MISMATCH',
          severity: 'error',
          pillLabel: 'MATH?',
          message: `Tax calculation mismatch: expected ₹${expectedTax.toLocaleString('en-IN')}, found ₹${actualTax.toLocaleString('en-IN')} (diff ₹${diff.toFixed(2)})`,
          expected: expectedTax,
          actual: actualTax,
        });
      }
    }
  }

  // 5. Document AI Confidence Check
  if (input.docAiConfidence !== undefined && input.docAiConfidence < CONFIG.docAI.confidenceWarnBelow) {
    flags.push({
      field: 'confidence',
      code: 'LOW_CONFIDENCE',
      severity: 'warning',
      pillLabel: 'CONFIDENCE?',
      message: `Document AI extraction confidence is ${(input.docAiConfidence * 100).toFixed(0)}% (below recommended ${(CONFIG.docAI.confidenceWarnBelow * 100).toFixed(0)}%). Review extracted values.`,
      expected: CONFIG.docAI.confidenceWarnBelow,
      actual: input.docAiConfidence,
    });
  }

  const blockingErrorsCount = flags.filter((f) => f.severity === 'error').length;
  const warningsCount = flags.filter((f) => f.severity === 'warning').length;

  let status: ValidationStatus = 'green';
  if (blockingErrorsCount > 0) {
    status = 'red';
  } else if (warningsCount > 0) {
    status = 'amber';
  }

  return {
    status,
    isValid: blockingErrorsCount === 0,
    flags,
    blockingErrorsCount,
    warningsCount,
  };
}
