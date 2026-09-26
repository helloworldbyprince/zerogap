import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, getFirestoreDb } from '@/lib/firebase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let job = memoryStore.jobs.get(id);

    if (!job) {
      const db = getFirestoreDb();
      if (db) {
        const snap = await db.collection('jobs').doc(id).get();
        if (snap.exists) {
          job = { id: snap.id, ...snap.data() };
        }
      }
    }

    if (!job) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Job ${id} not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Error fetching job status' } },
      { status: 500 }
    );
  }
}
