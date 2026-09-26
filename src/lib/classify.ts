import { CONFIG } from './config';

export type Gstr1Section = 'B2B' | 'B2CL' | 'B2CS';

export interface ClassifyInput {
  ctin?: string | null;
  pos: string; // 2-digit Place of Supply state code, e.g. '07'
  supplierStateCode: string; // 2-digit supplier state code, e.g. '06'
  grandTotal: number;
}

/**
 * §2.5 Invoice auto-classification (Feature 1)
 * 1. Customer GSTIN present & non-empty -> B2B
 * 2. No GSTIN + inter-state + invoice value > threshold (₹2,50,000) -> B2CL
 * 3. Everything else B2C -> B2CS (aggregated per state × rate)
 */
export function classifyInvoice(input: ClassifyInput): Gstr1Section {
  const hasCtin = !!input.ctin && input.ctin.trim().length > 0;

  if (hasCtin) {
    return 'B2B';
  }

  const isInterState = input.pos !== input.supplierStateCode;
  const isLargeInvoice = input.grandTotal > CONFIG.gstr1.b2clThreshold;

  if (isInterState && isLargeInvoice) {
    return 'B2CL';
  }

  return 'B2CS';
}
