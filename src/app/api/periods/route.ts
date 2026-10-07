import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalRollups } from '@/lib/bigquery';
import { DEMO_BIZ_ID, memoryStore } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;

    if (bizId === DEMO_BIZ_ID) {
      const data = await getHistoricalRollups(bizId);
      return NextResponse.json(data);
    }

    const monthly = Array.from(memoryStore.periods.values())
      .filter((record: any) => record.bizId === bizId)
      .map((record: any) => {
        const period = String(record.period || record.id);
        const date = new Date(Date.UTC(Number(period.slice(0, 4)), Number(period.slice(4, 6)) - 1, 1));
        const gap = Math.abs(Number(record.triangle?.itcGap || 0));
        return {
          period,
          periodLabel: new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date),
          salesTax: Number(record.totals?.salesTax || 0),
          itcAvailable: Number(record.totals?.itcAvailable2B || 0),
          itcClaimed: Number(record.totals?.itcClaimed || 0),
          gap,
          status: gap === 0 ? 'green' : gap <= 1000 ? 'amber' : 'red',
          statusLabel: gap === 0 ? 'All clear' : gap <= 1000 ? `Minor gap: ₹${gap.toLocaleString('en-IN')}` : `Action needed: ₹${gap.toLocaleString('en-IN')}`,
        };
      })
      .sort((a: any, b: any) => a.period.localeCompare(b.period));

    const totalSalesTax = monthly.reduce((sum: number, row: any) => sum + row.salesTax, 0);
    const totalItcAvailable = monthly.reduce((sum: number, row: any) => sum + row.itcAvailable, 0);
    const totalItcClaimed = monthly.reduce((sum: number, row: any) => sum + row.itcClaimed, 0);
    const gapsFound = monthly.filter((row: any) => row.gap > 0).length;
    const data = {
      monthly,
      quarterly: [],
      yearly: {
        financialYear: 'FY 2026–27 (Year-to-date)',
        salesTax: totalSalesTax,
        itcAvailable: totalItcAvailable,
        itcClaimed: totalItcClaimed,
        totalGaps: gapsFound,
        gstr9Note: monthly.length ? 'Year-to-date totals from saved workspace periods.' : 'No saved periods yet.',
      },
    };
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed fetching period rollups' } },
      { status: 500 }
    );
  }
}
