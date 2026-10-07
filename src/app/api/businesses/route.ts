import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CONFIG } from '@/lib/config';
import { memoryStore, getFirestoreDb, getAuthenticatedUid, DEMO_BIZ_ID } from '@/lib/firebase-admin';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const LOCAL_BUSINESSES_FILE = path.join(process.cwd(), 'tmp', 'zerogap-businesses.json');
const USE_LOCAL_BUSINESS_STORE = !process.env.K_SERVICE;

async function loadLocalBusinesses() {
  if (!USE_LOCAL_BUSINESS_STORE) return;
  try {
    const saved = JSON.parse(await readFile(LOCAL_BUSINESSES_FILE, 'utf8'));
    if (Array.isArray(saved)) {
      saved.forEach((business) => {
        if (business?.id && business.id !== DEMO_BIZ_ID) memoryStore.businesses.set(business.id, business);
      });
    }
  } catch (error: any) {
    if (error?.code !== 'ENOENT') console.warn('Local business store read warning:', error);
  }
}

async function saveLocalBusinesses() {
  if (!USE_LOCAL_BUSINESS_STORE) return;
  const businesses = Array.from(memoryStore.businesses.values()).filter((business) => business.id !== DEMO_BIZ_ID);
  await mkdir(path.dirname(LOCAL_BUSINESSES_FILE), { recursive: true });
  await writeFile(LOCAL_BUSINESSES_FILE, JSON.stringify(businesses, null, 2), 'utf8');
}

const BusinessSchema = z.object({
  name: z.string().min(2, 'Business name must have at least 2 characters'),
  gstin: z.string().regex(new RegExp(CONFIG.validation.gstinRegex), 'Invalid GSTIN format'),
  turnoverSlab: z.enum(['UNDER_5CR', 'OVER_5CR']),
  stateCode: z.string().length(2, 'State code must be 2 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const ownerUid = await getAuthenticatedUid(req);
    if (!ownerUid) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in is required.' } }, { status: 401 });
    await loadLocalBusinesses();
    const body = await req.json();
    const parsed = BusinessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: parsed.error.issues[0]?.message || 'Validation failed' } },
        { status: 400 }
      );
    }

    const existing = Array.from(memoryStore.businesses.values()).reverse().find(
      (business) => business.id !== DEMO_BIZ_ID && business.ownerUid === ownerUid && business.gstin === parsed.data.gstin
    );
    if (existing) {
      return NextResponse.json({ bizId: existing.id, business: existing, existing: true });
    }

    const bizId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBiz = {
      id: bizId,
      ...parsed.data,
      ownerUid,
      createdAt: new Date().toISOString(),
    };

    // Store in memory
    memoryStore.businesses.set(bizId, newBiz);
    await saveLocalBusinesses();

    // Persist to Firestore if available
    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection('businesses').doc(bizId).set(newBiz);
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }
    }

    return NextResponse.json({ bizId, business: newBiz }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const ownerUid = await getAuthenticatedUid(req);
    await loadLocalBusinesses();
    const list: any[] = [memoryStore.businesses.get(DEMO_BIZ_ID)].filter(Boolean);
    const db = getFirestoreDb();

    if (db && ownerUid) {
      try {
        // Migrate legacy localhost profiles created before UID ownership existed.
        for (const [id, business] of memoryStore.businesses.entries()) {
          if (id !== DEMO_BIZ_ID && business.ownerUid === 'user_active') {
            const migrated = { ...business, ownerUid, updatedAt: new Date().toISOString() };
            memoryStore.businesses.set(id, migrated);
            await db.collection('businesses').doc(id).set(migrated, { merge: true });
          }
        }
        await saveLocalBusinesses();
        const snap = await db.collection('businesses').where('ownerUid', '==', ownerUid).get();
        snap.forEach((doc: any) => list.push({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn('Firestore read error, falling back to memory store:', e);
      }
    }

    // Merge memory store
    memoryStore.businesses.forEach((biz) => {
      if ((biz.id === DEMO_BIZ_ID || (ownerUid && biz.ownerUid === ownerUid)) && !list.some((b) => b.id === biz.id)) {
        list.push(biz);
      }
    });

    const uniqueBusinesses = Array.from(
      list.reduce((unique, business) => {
        const key = business.id === DEMO_BIZ_ID ? business.id : business.gstin || business.id;
        unique.set(key, business);
        return unique;
      }, new Map<string, any>()).values()
    );

    return NextResponse.json({ businesses: uniqueBusinesses });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed fetching businesses' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ownerUid = await getAuthenticatedUid(req);
    if (!ownerUid) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in is required.' } }, { status: 401 });
    await loadLocalBusinesses();
    const body = await req.json();
    const bizId = z.string().min(1).parse(body.bizId);
    if (bizId === DEMO_BIZ_ID) return NextResponse.json({ error: { code: 'VALIDATION_FAILED', message: 'Demo business is read-only.' } }, { status: 400 });
    const parsed = BusinessSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_FAILED', message: parsed.error.issues[0]?.message || 'Validation failed' } }, { status: 400 });
    const existing = memoryStore.businesses.get(bizId);
    if (!existing) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Business not found.' } }, { status: 404 });
    if (existing.ownerUid !== ownerUid) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'This business belongs to another account.' } }, { status: 403 });
    const updated = { ...existing, ...parsed.data, updatedAt: new Date().toISOString() };
    memoryStore.businesses.set(bizId, updated);
    await saveLocalBusinesses();
    const db = getFirestoreDb();
    if (db) await db.collection('businesses').doc(bizId).set(updated, { merge: true });
    return NextResponse.json({ business: updated });
  } catch (error: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message || 'Could not update business.' } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ownerUid = await getAuthenticatedUid(req);
    if (!ownerUid) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in is required.' } }, { status: 401 });
    const bizId = new URL(req.url).searchParams.get('bizId');
    if (!bizId) return NextResponse.json({ error: { code: 'VALIDATION_FAILED', message: 'bizId is required.' } }, { status: 400 });
    if (bizId === DEMO_BIZ_ID) return NextResponse.json({ error: { code: 'VALIDATION_FAILED', message: 'Demo business data cannot be deleted.' } }, { status: 400 });
    const business = memoryStore.businesses.get(bizId);
    if (business && business.ownerUid !== ownerUid) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'This business belongs to another account.' } }, { status: 403 });
    for (const store of [memoryStore.periods, memoryStore.jobs, memoryStore.invoices, memoryStore.purchases, memoryStore.gstr2b, memoryStore.reco]) {
      for (const [key, value] of store.entries()) if (value?.bizId === bizId) store.delete(key);
    }
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message || 'Could not delete business data.' } }, { status: 500 });
  }
}
