import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';
import { CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;
    const period = searchParams.get('period') || DEMO_PERIOD;
    const kind = searchParams.get('kind') || 'sales';
    const section = searchParams.get('section') || 'ALL';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || String(CONFIG.ui.pageSize), 10);

    // Fetch from memoryStore (instant & reliable)
    let allInvoices: any[] = [];
    for (const inv of memoryStore.invoices.values()) {
      if (inv.bizId === bizId && inv.period === period && inv.kind === kind) {
        allInvoices.push(inv);
      }
    }

    // Try Firestore if available and memoryStore empty
    if (allInvoices.length === 0) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const colName = kind === 'sales' ? 'salesInvoices' : 'purchaseInvoices';
          const snap = await db
            .collection('businesses')
            .doc(bizId)
            .collection('periods')
            .doc(period)
            .collection(colName)
            .get();

          allInvoices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {
          console.warn('Firestore invoices query warning:', e);
        }
      }
    }

    // Compute comprehensive summary metrics
    const totalBills = allInvoices.length;
    let salesTxval = 0;
    let salesTax = 0;
    let b2bCount = 0;
    let b2clCount = 0;
    let b2csCount = 0;
    let greenCount = 0;
    let amberCount = 0;
    let redCount = 0;

    for (const inv of allInvoices) {
      salesTxval += inv.totals?.txval || 0;
      salesTax += inv.totals?.totalTax || 0;
      if (inv.section === 'B2B') b2bCount++;
      if (inv.section === 'B2CL') b2clCount++;
      if (inv.section === 'B2CS') b2csCount++;

      if (inv.status === 'green') greenCount++;
      else if (inv.status === 'amber') amberCount++;
      else if (inv.status === 'red') redCount++;
    }

    const flagCount = amberCount + redCount;

    // Filter by section if specified
    let filtered = allInvoices;
    if (section !== 'ALL') {
      filtered = filtered.filter((inv) => inv.section === section);
    }

    // Filter by status if specified
    if (status !== 'all') {
      filtered = filtered.filter((inv) => inv.status === status);
    }

    // Sort by invoice number or date
    filtered.sort((a, b) => (a.inum > b.inum ? 1 : -1));

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      invoices: paginated,
      totalCount: filtered.length,
      page,
      pageSize,
      summary: {
        totalBills,
        salesTxval,
        salesTax,
        b2bCount,
        b2clCount,
        b2csCount,
        flagCount,
        redCount,
        amberCount,
        greenCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to fetch invoices' } },
      { status: 500 }
    );
  }
}
