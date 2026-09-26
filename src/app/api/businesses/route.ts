import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CONFIG } from '@/lib/config';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID } from '@/lib/firebase-admin';

const BusinessSchema = z.object({
  name: z.string().min(2, 'Business name must have at least 2 characters'),
  gstin: z.string().regex(new RegExp(CONFIG.validation.gstinRegex), 'Invalid GSTIN format'),
  turnoverSlab: z.enum(['UNDER_5CR', 'OVER_5CR']),
  stateCode: z.string().length(2, 'State code must be 2 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BusinessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: parsed.error.issues[0]?.message || 'Validation failed' } },
        { status: 400 }
      );
    }

    const bizId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBiz = {
      id: bizId,
      ...parsed.data,
      ownerUid: 'user_active',
      createdAt: new Date().toISOString(),
    };

    // Store in memory
    memoryStore.businesses.set(bizId, newBiz);

    // Persist to Firestore if available
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection('businesses').doc(bizId).set(newBiz);
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }
    }

    return NextResponse.json({ bizId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const list: any[] = [];
    const db = getFirestoreDb();

    if (db) {
      try {
        const snap = await db.collection('businesses').get();
        snap.forEach((doc: any) => list.push({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn('Firestore read error, falling back to memory store:', e);
      }
    }

    // Merge memory store
    memoryStore.businesses.forEach((biz) => {
      if (!list.some((b) => b.id === biz.id)) {
        list.push(biz);
      }
    });

    return NextResponse.json({ businesses: list });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed fetching businesses' } },
      { status: 500 }
    );
  }
}
