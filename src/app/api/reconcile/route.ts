import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';
import { runReconciliation } from '@/lib/match';
import { CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;
    const period = searchParams.get('period') || DEMO_PERIOD;

    const cacheKey = `${bizId}_${period}`;
    let result = memoryStore.reco.get(cacheKey);

    // If not found in memoryStore, try Firestore
    if (!result) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const docSnap = await db
            .collection('businesses')
            .doc(bizId)
            .collection('periods')
            .doc(period)
            .collection('reco')
            .doc('summary')
            .get();

          if (docSnap.exists) {
            result = docSnap.data();
            memoryStore.reco.set(cacheKey, result);
          }
        } catch (e) {
          console.warn('Firestore reco read warning:', e);
        }
      }
    }

    // Fallback: if still null and it's demo, generate demo snapshot
    if (!result) {
      result = {
        bizId,
        period,
        matchScore: CONFIG.demo.matchScore,
        matchedCount: CONFIG.demo.matchedCount,
        totalBillsCount: CONFIG.demo.totalBillsCount,
        moneyAtRisk: CONFIG.demo.moneyAtRisk,
        missingIn2BCount: CONFIG.demo.missingIn2BCount,
        missingInBooksCount: CONFIG.demo.missingInBooksCount,
        mismatchesCount: CONFIG.demo.mismatchesCount,
        items: [],
        reconciledAt: new Date().toISOString(),
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed fetching reconciliation results' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const bizId = body.bizId || DEMO_BIZ_ID;
    const period = body.period || DEMO_PERIOD;

    const jobId = `job_reco_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Gather purchase invoices
    const purchases: any[] = [];
    for (const inv of memoryStore.purchases.values()) {
      if (inv.bizId === bizId && inv.period === period) {
        purchases.push(inv);
      }
    }

    // Gather GSTR-2B records
    const gstr2bList: any[] = [];
    for (const rec of memoryStore.gstr2b.values()) {
      if (rec.bizId === bizId && rec.period === period) {
        gstr2bList.push(rec);
      }
    }

    // Execute matching engine (§2.8 & Feature 2)
    const reco = runReconciliation(purchases, gstr2bList);

    const snapshot = {
      bizId,
      period,
      ...reco,
    };

    // Save in memory store
    const cacheKey = `${bizId}_${period}`;
    memoryStore.reco.set(cacheKey, snapshot);

    // Save job in memory
    const jobRecord = {
      id: jobId,
      type: 'RECONCILIATION',
      bizId,
      period,
      status: 'done',
      progress: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.jobs.set(jobId, jobRecord);

    // Update period status in memory
    let periodDoc = memoryStore.periods.get(cacheKey);
    if (!periodDoc) {
      periodDoc = {
        id: period,
        bizId,
        period,
        status: { f1: 'done', f2: 'done', f3: 'idle' },
        totals: { salesTxval: 0, salesTax: 0, purchaseTxval: 0, itcAvailable2B: 0, itcClaimed: 0 },
        triangle: { liabilityGap: 0, itcGap: 0 },
        moneyAtRisk: reco.moneyAtRisk,
        matchScore: reco.matchScore,
        updatedAt: new Date().toISOString(),
      };
    } else {
      periodDoc.status.f2 = 'done';
      periodDoc.matchScore = reco.matchScore;
      periodDoc.moneyAtRisk = reco.moneyAtRisk;
      periodDoc.updatedAt = new Date().toISOString();
    }
    memoryStore.periods.set(cacheKey, periodDoc);

    // Save to Firestore if connected
    const db = getFirestoreDb();
    if (db) {
      try {
        await db
          .collection('businesses')
          .doc(bizId)
          .collection('periods')
          .doc(period)
          .collection('reco')
          .doc('summary')
          .set(snapshot);

        await db
          .collection('businesses')
          .doc(bizId)
          .collection('periods')
          .doc(period)
          .set(periodDoc, { merge: true });

        await db.collection('jobs').doc(jobId).set(jobRecord);
      } catch (e) {
        console.warn('Firestore reco write warning:', e);
      }
    }

    // Return 202 Accepted per SPEC.md Phase 5 contract
    return NextResponse.json(
      {
        jobId,
        status: 'accepted',
        matchScore: reco.matchScore,
        moneyAtRisk: reco.moneyAtRisk,
        matchedCount: reco.matchedCount,
        totalBillsCount: reco.totalBillsCount,
        result: snapshot,
      },
      { status: 202 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Reconciliation failed' } },
      { status: 500 }
    );
  }
}
