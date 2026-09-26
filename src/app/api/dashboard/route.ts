import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bizId = searchParams.get('bizId') || DEMO_BIZ_ID;
    const period = searchParams.get('period') || DEMO_PERIOD;

    const cacheKey = `${bizId}_${period}`;
    let periodDoc = memoryStore.periods.get(cacheKey);

    if (!periodDoc) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const snap = await db
            .collection('businesses')
            .doc(bizId)
            .collection('periods')
            .doc(period)
            .get();

          if (snap.exists) {
            periodDoc = { id: snap.id, ...snap.data() };
          }
        } catch (e) {
          console.warn('Firestore dashboard read warning:', e);
        }
      }
    }

    // If still not found, return demo period snapshot for seamless UX
    if (!periodDoc) {
      periodDoc = memoryStore.periods.get(`${DEMO_BIZ_ID}_${DEMO_PERIOD}`);
    }

    return NextResponse.json({ period: periodDoc });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed fetching dashboard data' } },
      { status: 500 }
    );
  }
}
