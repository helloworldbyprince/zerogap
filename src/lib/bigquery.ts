import { BigQuery } from '@google-cloud/bigquery';
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';

const projectId = process.env.GCP_PROJECT_ID || 'zerogap-509816';
const location = process.env.GCP_REGION || 'asia-south1';
const datasetId = 'gst';

let bqClient: BigQuery | null = null;

function getBigQueryClient(): BigQuery | null {
  if (bqClient) return bqClient;

  // Clear non-existent credential paths
  if (
    process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
  }

  try {
    bqClient = new BigQuery({ projectId, location });
    return bqClient;
  } catch (err: any) {
    console.warn('BigQuery client init warning:', err?.message || err);
    return null;
  }
}

export type BigQueryTable =
  | 'sales_invoices'
  | 'purchase_invoices'
  | 'gstr2b_records'
  | 'reco_results';

/**
 * Dual-write ingested records to BigQuery partitioned tables (§6.2)
 */
export async function dualWriteToBigQuery(
  table: BigQueryTable,
  rows: Record<string, any>[]
): Promise<void> {
  if (!rows || rows.length === 0) return;

  const client = getBigQueryClient();
  if (!client) {
    // Graceful offline mock log
    return;
  }

  try {
    await client.dataset(datasetId).table(table).insert(rows);
  } catch (err: any) {
    console.warn(`BigQuery dual-write to ${table} notice:`, err?.message || err);
  }
}

export interface PeriodSummary {
  period: string; // '202607', '202608', '202609'
  periodLabel: string; // 'July 2026', 'August 2026', 'September 2026'
  salesTax: number;
  itcAvailable: number;
  itcClaimed: number;
  gap: number;
  status: 'green' | 'amber' | 'red';
  statusLabel: string;
}

export interface RollupResult {
  monthly: PeriodSummary[];
  quarterly: {
    quarter: string; // 'Q2 (Jul - Sep 2026)'
    salesTax: number;
    itcAvailable: number;
    itcClaimed: number;
    gapsFound: number;
  }[];
  yearly: {
    financialYear: string; // 'FY 2026-27'
    salesTax: number;
    itcAvailable: number;
    itcClaimed: number;
    totalGaps: number;
    gstr9Note: string;
  };
}

/**
 * Fetch 3-month realistic historical rollups for Screen 6 & GSTR-9 annual return (§6.2 & §14)
 */
export async function getHistoricalRollups(bizId: string): Promise<RollupResult> {
  // 3 months of historical data per §14:
  // - July 2026: Clean month (emerald 'All clear ✓' state)
  // - August 2026: 1 minor value mismatch
  // - September 2026: Active demo month (₹1,84,200 at risk, 1 credit gap of ₹2,300)
  const monthly: PeriodSummary[] = [
    {
      period: '202607',
      periodLabel: 'July 2026',
      salesTax: 124500,
      itcAvailable: 112000,
      itcClaimed: 112000,
      gap: 0,
      status: 'green',
      statusLabel: 'All clear ✓',
    },
    {
      period: '202608',
      periodLabel: 'August 2026',
      salesTax: 138900,
      itcAvailable: 128400,
      itcClaimed: 129000,
      gap: 600,
      status: 'amber',
      statusLabel: 'Minor gap: ₹600',
    },
    {
      period: '202609',
      periodLabel: 'September 2026',
      salesTax: CONFIG.demo.salesTax, // 151560
      itcAvailable: CONFIG.demo.itcAvailable2B, // 142300
      itcClaimed: CONFIG.demo.itcAvailable2B + CONFIG.demo.creditCheckGap, // 144600
      gap: CONFIG.demo.creditCheckGap, // 2300
      status: 'red',
      statusLabel: `Action needed: ₹${CONFIG.demo.creditCheckGap.toLocaleString('en-IN')}`,
    },
  ];

  const totalSalesTax = monthly.reduce((sum, m) => sum + m.salesTax, 0);
  const totalItcAvailable = monthly.reduce((sum, m) => sum + m.itcAvailable, 0);
  const totalItcClaimed = monthly.reduce((sum, m) => sum + m.itcClaimed, 0);
  const totalGapsFound = monthly.filter((m) => m.gap > 0).length;

  const quarterly = [
    {
      quarter: 'Q2 (Jul – Sep 2026)',
      salesTax: totalSalesTax,
      itcAvailable: totalItcAvailable,
      itcClaimed: totalItcClaimed,
      gapsFound: totalGapsFound,
    },
  ];

  const yearly = {
    financialYear: 'FY 2026–27 (Year-to-date)',
    salesTax: totalSalesTax,
    itcAvailable: totalItcAvailable,
    itcClaimed: totalItcClaimed,
    totalGaps: totalGapsFound,
    gstr9Note: 'This yearly view feeds your GSTR-9 annual return.',
  };

  return {
    monthly,
    quarterly,
    yearly,
  };
}
