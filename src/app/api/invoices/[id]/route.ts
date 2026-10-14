import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';
import { classifyInvoice } from '@/lib/classify';
import { validateInvoice } from '@/lib/validate';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let inv = memoryStore.invoices.get(id);

    if (!inv) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const bizDocs = await db.collection('businesses').get();
          for (const b of bizDocs.docs) {
            for (const col of ['salesInvoices', 'purchaseInvoices']) {
              const snap = await db
                .collection('businesses')
                .doc(b.id)
                .collection('periods')
                .doc(DEMO_PERIOD)
                .collection(col)
                .doc(id)
                .get();
              if (snap.exists) {
                inv = { id: snap.id, ...snap.data() } as any;
                if (inv) {
                  memoryStore.invoices.set(id, inv);
                  break;
                }
              }
            }
            if (inv) break;
          }
        } catch (e) {
          console.warn('Firestore invoice fetch warning:', e);
        }
      }
    }

    if (!inv) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Invoice ${id} not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice: inv });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    let existing = memoryStore.invoices.get(id);
    if (!existing) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const bizDocs = await db.collection('businesses').get();
          for (const b of bizDocs.docs) {
            for (const col of ['salesInvoices', 'purchaseInvoices']) {
              const snap = await db
                .collection('businesses')
                .doc(b.id)
                .collection('periods')
                .doc(DEMO_PERIOD)
                .collection(col)
                .doc(id)
                .get();
              if (snap.exists) {
                existing = { id: snap.id, ...snap.data() } as any;
                if (existing) {
                  memoryStore.invoices.set(id, existing);
                  break;
                }
              }
            }
            if (existing) break;
          }
        } catch (e) {
          console.warn('Firestore invoice fetch warning in PATCH:', e);
        }
      }
    }

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Invoice ${id} not found` } },
        { status: 404 }
      );
    }

    // Resolve business profile from memoryStore or Firestore
    let biz = memoryStore.businesses.get(existing.bizId || DEMO_BIZ_ID);
    if (!biz && existing.bizId) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const bDoc = await db.collection('businesses').doc(existing.bizId).get();
          if (bDoc.exists) {
            biz = bDoc.data() as any;
            if (biz) memoryStore.businesses.set(existing.bizId, biz);
          }
        } catch (e) {
          console.warn('Firestore business fetch warning in PATCH:', e);
        }
      }
    }

    if (!biz) {
      biz = {
        stateCode: '06',
        turnoverSlab: 'UNDER_5CR',
      };
    }

    // Merge updated fields with clean formatting
    const inum = body.inum !== undefined ? String(body.inum).trim() : existing.inum;
    const idt = body.idt !== undefined ? String(body.idt).trim() : existing.idt;
    const ctin = body.ctin !== undefined ? String(body.ctin).trim().toUpperCase() : (existing.ctin || '');
    const ctinName = body.ctinName !== undefined ? String(body.ctinName).trim() : existing.ctinName;

    // Automatic Place of Supply derivation from GSTIN if not explicitly passed
    let pos = body.pos !== undefined ? String(body.pos).trim() : '';
    if (!pos) {
      if (ctin && ctin.length >= 2 && /^\d{2}/.test(ctin)) {
        pos = ctin.substring(0, 2);
      } else {
        pos = existing.pos || biz.stateCode || '06';
      }
    }

    // Update items and recalculate tax split
    let items = body.items !== undefined ? body.items : (existing.items || []);

    if (body.hsn !== undefined || body.rt !== undefined || body.txval !== undefined) {
      const itm = { ...(items[0] || {}) };
      if (body.hsn !== undefined) itm.hsn = String(body.hsn).trim();
      if (body.rt !== undefined) itm.rt = Number(body.rt);
      if (body.txval !== undefined) itm.txval = Number(body.txval);

      const isInterState = pos !== (biz.stateCode || '06');
      const tax = Math.round(((itm.txval * itm.rt) / 100) * 100) / 100;
      itm.iamt = isInterState ? tax : 0;
      itm.camt = isInterState ? 0 : Math.round((tax / 2) * 100) / 100;
      itm.samt = isInterState ? 0 : Math.round((tax - itm.camt) * 100) / 100;
      itm.csamt = 0;

      items = [itm];
    }

    // Recalculate totals
    const txval = items.reduce((s: number, i: any) => s + (Number(i.txval) || 0), 0);
    const iamt = items.reduce((s: number, i: any) => s + (Number(i.iamt) || 0), 0);
    const camt = items.reduce((s: number, i: any) => s + (Number(i.camt) || 0), 0);
    const samt = items.reduce((s: number, i: any) => s + (Number(i.samt) || 0), 0);
    const totalTax = iamt + camt + samt;
    const grandTotal = txval + totalTax;

    const totals = { txval, iamt, camt, samt, csamt: 0, totalTax, grandTotal };

    // Auto-classify section (§2.5)
    const section = classifyInvoice({
      ctin,
      pos,
      supplierStateCode: biz.stateCode || '06',
      grandTotal,
    });

    // Run Validation Engine with all updated values (§2.6)
    const validation = validateInvoice({
      inum,
      idt,
      ctin,
      section,
      turnoverSlab: biz.turnoverSlab || 'UNDER_5CR',
      items,
      totals,
      correctedByUser: true,
      period: existing.period,
      kind: existing.kind,
      bizGstin: biz.gstin,
      supplierGstin: existing.supplierGstin || biz.gstin,
    });

    const updatedInvoice = {
      ...existing,
      inum,
      idt,
      ctin,
      ctinName,
      pos,
      section,
      items,
      totals,
      status: validation.status,
      flag: validation.flags[0] || null,
      flags: validation.flags,
      correctedByUser: true,
      confirmed: validation.status === 'green',
      updatedAt: new Date().toISOString(),
    };

    // Save to memoryStore
    memoryStore.invoices.set(id, updatedInvoice);

    // Save to Firestore if available
    const db = getFirestoreDb();
    if (db) {
      try {
        const colName = updatedInvoice.kind === 'sales' ? 'salesInvoices' : 'purchaseInvoices';
        await db
          .collection('businesses')
          .doc(updatedInvoice.bizId)
          .collection('periods')
          .doc(updatedInvoice.period)
          .collection(colName)
          .doc(id)
          .set(updatedInvoice, { merge: true });
      } catch (e) {
        console.warn('Firestore invoice update warning:', e);
      }
    }

    // Refresh Period Snapshot
    const periodKey = `${updatedInvoice.bizId}_${updatedInvoice.period}`;
    const periodDoc = memoryStore.periods.get(periodKey);
    if (periodDoc) {
      let pSalesTxval = 0;
      let pSalesTax = 0;
      for (const inv of memoryStore.invoices.values()) {
        if (inv.bizId === updatedInvoice.bizId && inv.period === updatedInvoice.period && inv.kind === 'sales') {
          pSalesTxval += inv.totals?.txval || 0;
          pSalesTax += inv.totals?.totalTax || 0;
        }
      }
      periodDoc.totals.salesTxval = pSalesTxval;
      periodDoc.totals.salesTax = pSalesTax;
      periodDoc.updatedAt = new Date().toISOString();
      memoryStore.periods.set(periodKey, periodDoc);
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      validation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to update invoice' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = memoryStore.invoices.get(id) || memoryStore.purchases.get(id);

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Invoice ${id} not found` } },
        { status: 404 }
      );
    }

    memoryStore.invoices.delete(id);
    memoryStore.purchases.delete(id);

    const db = getFirestoreDb();
    if (db && existing.bizId && existing.period) {
      try {
        const colName = existing.kind === 'sales' ? 'salesInvoices' : 'purchaseInvoices';
        await db
          .collection('businesses')
          .doc(existing.bizId)
          .collection('periods')
          .doc(existing.period)
          .collection(colName)
          .doc(id)
          .delete();
      } catch (e) {
        console.warn('Firestore invoice delete warning:', e);
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to delete invoice' } },
      { status: 500 }
    );
  }
}
