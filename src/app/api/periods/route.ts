import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalRollups } from '@/lib/bigquery';
import { DEMO_BIZ_ID } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;

    const data = await getHistoricalRollups(bizId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed fetching period rollups' } },
      { status: 500 }
    );
  }
}
