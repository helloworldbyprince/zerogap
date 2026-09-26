import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const bizId = body.bizId || DEMO_BIZ_ID;
    const period = body.period || DEMO_PERIOD;

    let confirmedCount = 0;

    for (const [id, inv] of memoryStore.invoices.entries()) {
      if (inv.bizId === bizId && inv.period === period && inv.status === 'green') {
        inv.confirmed = true;
        inv.updatedAt = new Date().toISOString();
        memoryStore.invoices.set(id, inv);
        confirmedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      confirmedCount,
      message: `Confirmed ${confirmedCount} verified bills`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
