import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryStore, getFirestoreDb } from '@/lib/firebase-admin';

const UploadSchema = z.object({
  bizId: z.string().min(1, 'bizId is required'),
  period: z.string().min(6, 'period must be at least YYYYMM'),
  kind: z.enum(['sales', 'purchase', 'gstr2b']),
  fileCount: z.number().optional().default(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: parsed.error.issues[0]?.message || 'Validation failed' } },
        { status: 400 }
      );
    }

    const { bizId, period, kind, fileCount } = parsed.data;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newJob = {
      id: jobId,
      type: `UPLOAD_${kind.toUpperCase()}`,
      bizId,
      period,
      status: 'done', // completed for Phase 2 plumbing, worker wired in Phase 3
      progress: 100,
      filesProcessed: fileCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.jobs.set(jobId, newJob);

    const db = getFirestoreDb();
    if (db) {
      try {
        await db.collection('jobs').doc(jobId).set(newJob);
      } catch (e) {
        console.warn('Firestore job write warning:', e);
      }
    }

    // Return 202 Accepted as required by §7 & §5
    return NextResponse.json({ jobId, status: 'accepted' }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Upload job initiation failed' } },
      { status: 500 }
    );
  }
}
