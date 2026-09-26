import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryStore, getFirestoreDb, DEMO_BIZ_ID, DEMO_PERIOD } from '@/lib/firebase-admin';
import { processUploadJob, FileToProcess } from '@/jobs/uploadWorker';
import { CONFIG } from '@/lib/config';

const UploadJsonSchema = z.object({
  bizId: z.string().min(1, 'bizId is required'),
  period: z.string().min(6, 'period must be at least YYYYMM'),
  kind: z.enum(['sales', 'purchase', 'gstr2b']),
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number().optional(),
        type: z.string().optional(),
        dataBase64: z.string().optional(),
      })
    )
    .optional(),
  fileCount: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let bizId: string = DEMO_BIZ_ID;
    let period: string = DEMO_PERIOD;
    let kind: 'sales' | 'purchase' | 'gstr2b' = 'sales';
    const filesToProcess: FileToProcess[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      bizId = (formData.get('bizId') as string) || DEMO_BIZ_ID;
      period = (formData.get('period') as string) || DEMO_PERIOD;
      kind = ((formData.get('kind') as string) || 'sales') as any;

      const fileEntries = formData.getAll('files');
      for (const entry of fileEntries) {
        if (entry instanceof File) {
          const arrayBuffer = await entry.arrayBuffer();
          filesToProcess.push({
            name: entry.name,
            size: entry.size,
            mimeType: entry.type || 'application/pdf',
            buffer: Buffer.from(arrayBuffer),
          });
        }
      }
    } else {
      const body = await req.json();
      const parsed = UploadJsonSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_FAILED',
              message: parsed.error.issues[0]?.message || 'Validation failed',
            },
          },
          { status: 400 }
        );
      }

      bizId = parsed.data.bizId;
      period = parsed.data.period;
      kind = parsed.data.kind;

      if (parsed.data.files && parsed.data.files.length > 0) {
        for (const f of parsed.data.files) {
          const buf = f.dataBase64 ? Buffer.from(f.dataBase64, 'base64') : Buffer.from(f.name);
          filesToProcess.push({
            name: f.name,
            size: f.size || 1024,
            mimeType: f.type || 'application/pdf',
            buffer: buf,
          });
        }
      } else {
        // Fallback simulated upload files if none passed directly
        const count = parsed.data.fileCount || 1;
        for (let i = 1; i <= count; i++) {
          filesToProcess.push({
            name: `INV-${String(Math.floor(100 + Math.random() * 900))}.pdf`,
            size: 245000,
            mimeType: 'application/pdf',
            buffer: Buffer.from('simulated-pdf-stream'),
          });
        }
      }
    }

    // Enforce max files check (§10)
    if (filesToProcess.length > CONFIG.uploads.maxFiles) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_FAILED',
            message: `Maximum ${CONFIG.uploads.maxFiles} files allowed per upload batch.`,
          },
        },
        { status: 400 }
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newJob = {
      id: jobId,
      type: `UPLOAD_${kind.toUpperCase()}`,
      bizId,
      period,
      status: 'processing',
      progress: 5,
      totalFiles: filesToProcess.length,
      filesProcessed: 0,
      files: filesToProcess.map((f) => ({
        name: f.name,
        size: f.size,
        status: 'queued',
      })),
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

    // Trigger asynchronous worker immediately without blocking 202 response (§5 step ② & §8)
    setTimeout(() => {
      processUploadJob(jobId, bizId, period, kind, filesToProcess).catch((err) => {
        console.error('Background worker error:', err);
      });
    }, 50);

    // Return 202 Accepted (<300ms)
    return NextResponse.json(
      {
        jobId,
        status: 'accepted',
        filesCount: filesToProcess.length,
      },
      { status: 202 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Upload job initiation failed' } },
      { status: 500 }
    );
  }
}
