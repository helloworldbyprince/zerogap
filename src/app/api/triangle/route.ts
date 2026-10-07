import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';
import { computeTriangleAudit, TriangleInput } from '@/lib/triangle';
import { CONFIG } from '@/lib/config';
import { z } from 'zod';

const TriangleSchema = z.object({
  bizId: z.string().min(1).optional(),
  period: z.string().regex(/^\d{4}(0[1-9]|1[0-2])$/).optional(),
  gstr1TaxLiability: z.coerce.number().finite().nonnegative().optional(),
  gstr2bCreditAvailable: z.coerce.number().finite().nonnegative().optional(),
  gstr3bTaxPaid: z.coerce.number().finite().nonnegative().optional(),
  gstr3bItcClaimed: z.coerce.number().finite().nonnegative().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;
    const period = searchParams.get('period') || DEMO_PERIOD;

    // For demo business or period, guarantee exact statutory numbers from CONFIG.demo
    const isDemo = bizId === DEMO_BIZ_ID || bizId === CONFIG.demo.businessName;

    let salesTax: number = isDemo ? CONFIG.demo.salesTax : 0;
    let itc2B: number = isDemo ? CONFIG.demo.itcAvailable2B : 0;
    let salesInvoiceCount = 0;
    let supplierRecordCount = 0;

    if (!isDemo) {
      for (const inv of memoryStore.invoices.values()) {
        if (inv.bizId === bizId && inv.period === period && inv.kind === 'sales') {
          salesTax += inv.totals?.totalTax || 0;
          salesInvoiceCount += 1;
        }
      }

      for (const rec of memoryStore.gstr2b.values()) {
        if (rec.bizId === bizId && rec.period === period) {
          itc2B += (rec.iamt || 0) + (rec.camt || 0) + (rec.samt || 0);
          supplierRecordCount += 1;
        }
      }
    } else {
      salesInvoiceCount = CONFIG.demo.salesBillsReady;
      supplierRecordCount = 42;
    }

    const periodDoc = memoryStore.periods.get(`${bizId}_${period}`);
    const gstr3bTaxPaid = isDemo ? CONFIG.demo.taxPaid3B : (periodDoc?.totals?.taxPaid3B || 0);
    const gstr3bItcClaimed = isDemo
      ? CONFIG.demo.itcAvailable2B + CONFIG.demo.creditCheckGap
      : (periodDoc?.totals?.itcClaimed || 0);

    const audit = computeTriangleAudit({
      gstr1TaxLiability: salesTax,
      gstr2bCreditAvailable: itc2B,
      gstr3bTaxPaid,
      gstr3bItcClaimed,
      bizId,
      period,
    });

    return NextResponse.json({ ...audit, sourceCounts: { salesInvoiceCount, supplierRecordCount } });
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
    const parsed = TriangleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: parsed.error.issues[0]?.message || 'Invalid triangle figures' } },
        { status: 400 }
      );
    }
    const values = parsed.data;
    const bizId = values.bizId || DEMO_BIZ_ID;
    const period = values.period || DEMO_PERIOD;

    const input: TriangleInput = {
      gstr1TaxLiability: values.gstr1TaxLiability,
      gstr2bCreditAvailable: values.gstr2bCreditAvailable,
      gstr3bTaxPaid: values.gstr3bTaxPaid,
      gstr3bItcClaimed: values.gstr3bItcClaimed,
      bizId,
      period,
    };

    const audit = computeTriangleAudit(input);

    // Update memoryStore period snapshot
    const periodKey = `${bizId}_${period}`;
    const periodDoc = memoryStore.periods.get(periodKey) || {
      id: period,
      bizId,
      period,
      status: { f1: 'idle', f2: 'idle', f3: 'idle' },
      totals: { salesTxval: 0, salesTax: 0, purchaseTxval: 0, itcAvailable2B: 0, itcClaimed: 0, taxPaid3B: 0 },
      triangle: { liabilityGap: 0, itcGap: 0 },
      moneyAtRisk: 0,
      matchScore: 0,
      updatedAt: new Date().toISOString(),
    };
    periodDoc.totals.itcAvailable2B = audit.gstr2bCreditAvailable;
    periodDoc.totals.itcClaimed = audit.gstr3bItcClaimed;
    periodDoc.totals.taxPaid3B = audit.gstr3bTaxPaid;
    periodDoc.triangle = {
      liabilityGap: audit.salesCheck.gap,
      itcGap: audit.creditCheck.gap,
    };
    periodDoc.status.f3 = 'done';
    periodDoc.updatedAt = new Date().toISOString();
    memoryStore.periods.set(periodKey, periodDoc);

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
              totals: {
                itcAvailable2B: audit.gstr2bCreditAvailable,
                itcClaimed: audit.gstr3bItcClaimed,
                taxPaid3B: audit.gstr3bTaxPaid,
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
