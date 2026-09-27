import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';
import { computeTriangleAudit, TriangleInput } from '@/lib/triangle';
import { CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;
    const period = searchParams.get('period') || DEMO_PERIOD;

    // For demo business or period, guarantee exact statutory numbers from CONFIG.demo
    const isDemo = bizId === DEMO_BIZ_ID || bizId === CONFIG.demo.businessName;

    let salesTax: number = CONFIG.demo.salesTax;
    let itc2B: number = CONFIG.demo.itcAvailable2B;

    if (!isDemo) {
      let calcSalesTax = 0;
      for (const inv of memoryStore.invoices.values()) {
        if (inv.bizId === bizId && inv.period === period && inv.kind === 'sales') {
          calcSalesTax += inv.totals?.totalTax || 0;
        }
      }
      if (calcSalesTax > 0) salesTax = calcSalesTax;

      let calcItc2B = 0;
      for (const rec of memoryStore.gstr2b.values()) {
        if (rec.bizId === bizId && rec.period === period) {
          calcItc2B += (rec.iamt || 0) + (rec.camt || 0) + (rec.samt || 0);
        }
      }
      if (calcItc2B > 0) itc2B = calcItc2B;
    }

    const audit = computeTriangleAudit({
      gstr1TaxLiability: salesTax,
      gstr2bCreditAvailable: itc2B,
      bizId,
      period,
    });

    return NextResponse.json(audit);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Triangle check failed' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const bizId = body.bizId || DEMO_BIZ_ID;
    const period = body.period || DEMO_PERIOD;

    const input: TriangleInput = {
      gstr1TaxLiability: body.gstr1TaxLiability !== undefined ? parseFloat(body.gstr1TaxLiability) : undefined,
      gstr2bCreditAvailable: body.gstr2bCreditAvailable !== undefined ? parseFloat(body.gstr2bCreditAvailable) : undefined,
      gstr3bTaxPaid: body.gstr3bTaxPaid !== undefined ? parseFloat(body.gstr3bTaxPaid) : undefined,
      gstr3bItcClaimed: body.gstr3bItcClaimed !== undefined ? parseFloat(body.gstr3bItcClaimed) : undefined,
      bizId,
      period,
    };

    const audit = computeTriangleAudit(input);

    // Update memoryStore period snapshot
    const periodKey = `${bizId}_${period}`;
    const periodDoc = memoryStore.periods.get(periodKey);
    if (periodDoc) {
      periodDoc.totals.itcAvailable2B = audit.gstr2bCreditAvailable;
      periodDoc.totals.itcClaimed = audit.gstr3bItcClaimed;
      periodDoc.triangle = {
        liabilityGap: audit.salesCheck.gap,
        itcGap: audit.creditCheck.gap,
      };
      periodDoc.status.f3 = 'done';
      periodDoc.updatedAt = new Date().toISOString();
      memoryStore.periods.set(periodKey, periodDoc);
    }

    // Save to Firestore if available
    const db = getFirestoreDb();
    if (db) {
      try {
        await db
          .collection('businesses')
          .doc(bizId)
          .collection('periods')
          .doc(period)
          .set(
            {
              triangle: {
                liabilityGap: audit.salesCheck.gap,
                itcGap: audit.creditCheck.gap,
              },
              status: { f3: 'done' },
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
      } catch (e) {
        console.warn('Firestore triangle write warning:', e);
      }
    }

    return NextResponse.json(audit);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Updating triangle figures failed' } },
      { status: 500 }
    );
  }
}
