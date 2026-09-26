import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';
import { buildGstr1Json, buildGstr1Excel, validateGstr1Export, formatPeriodToFp } from '@/lib/gstr1';
import { CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;
    const period = searchParams.get('period') || DEMO_PERIOD;
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const bypassGate = searchParams.get('bypassGate') === 'true';

    // 1. Fetch business
    const business = memoryStore.businesses.get(bizId) || {
      id: DEMO_BIZ_ID,
      name: CONFIG.demo.businessName,
      gstin: '06ABCDE1234F1Z5',
      stateCode: '06',
    };

    // 2. Fetch sales invoices
    let invoices: any[] = [];
    for (const inv of memoryStore.invoices.values()) {
      if (inv.bizId === bizId && inv.period === period && inv.kind === 'sales') {
        invoices.push(inv);
      }
    }

    if (invoices.length === 0) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const snap = await db
            .collection('businesses')
            .doc(bizId)
            .collection('periods')
            .doc(period)
            .collection('salesInvoices')
            .get();
          invoices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {
          console.warn('Firestore sales export fetch warning:', e);
        }
      }
    }

    // 3. Validation Gate (§2.6)
    const gate = validateGstr1Export(invoices);
    if (!gate.canExport && !bypassGate) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_FAILED',
            message: `Fix the ${gate.blockingCount} red rows above (or tick 'I have checked') to unlock the download.`,
            blockingCount: gate.blockingCount,
            redInvoices: gate.redInvoices,
          },
        },
        { status: 422 }
      );
    }

    const gstin = business.gstin || '06ABCDE1234F1Z5';
    const fp = formatPeriodToFp(period);

    // 4. Return Excel format
    if (format === 'xlsx' || format === 'excel') {
      const excelBuffer = await buildGstr1Excel(invoices, business, period);
      const filename = `GSTR1_${gstin}_${fp}.xlsx`;

      return new NextResponse(excelBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // 5. Return Byte-exact GSTR-1 JSON format (§2.4)
    const jsonOutput = buildGstr1Json(invoices, business, period);
    const filename = `GSTR1_${gstin}_${fp}.json`;

    return new NextResponse(JSON.stringify(jsonOutput, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Export generation failed' } },
      { status: 500 }
    );
  }
}
