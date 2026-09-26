import { parseInvoiceWithDocAI } from '@/lib/docai';
import { classifyInvoice } from '@/lib/classify';
import { validateInvoice } from '@/lib/validate';
import { parseGstr2bFile } from '@/lib/gstr2b';
import { memoryStore, getFirestoreDb } from '@/lib/firebase-admin';

export interface FileToProcess {
  name: string;
  size: number;
  mimeType: string;
  buffer: Buffer;
}

export async function processUploadJob(
  jobId: string,
  bizId: string,
  period: string,
  kind: 'sales' | 'purchase' | 'gstr2b',
  files: FileToProcess[]
) {
  const job = memoryStore.jobs.get(jobId);
  if (!job) return;

  try {
    const biz = memoryStore.businesses.get(bizId) || {
      stateCode: '06',
      turnoverSlab: 'UNDER_5CR',
    };

    const totalFiles = files.length;
    const processedItems = [];

    if (kind === 'gstr2b') {
      // Process GSTR-2B files (Excel / CSV)
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        job.status = 'processing';
        job.progress = Math.round(((i + 0.5) / totalFiles) * 100);
        job.currentFile = file.name;
        memoryStore.jobs.set(jobId, { ...job });

        const records = await parseGstr2bFile(file.buffer, file.name, bizId, period);

        for (const rec of records) {
          memoryStore.gstr2b.set(rec.id, rec);
          processedItems.push(rec);

          const db = getFirestoreDb();
          if (db) {
            try {
              await db
                .collection('businesses')
                .doc(bizId)
                .collection('periods')
                .doc(period)
                .collection('gstr2b')
                .doc(rec.id)
                .set(rec);
            } catch (e) {
              console.warn('Firestore GSTR-2B write warning:', e);
            }
          }
        }
      }
    } else {
      // Process invoices (Sales or Purchase bills)
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        // Update progress
        const progressPercent = Math.round(((i + 0.5) / totalFiles) * 100);
        job.status = 'processing';
        job.progress = progressPercent;
        job.currentFile = file.name;
        memoryStore.jobs.set(jobId, { ...job });

        // 1. Document AI parse
        const extracted = await parseInvoiceWithDocAI(file.buffer, file.mimeType, file.name);

        // 2. Classify section (§2.5)
        const section = classifyInvoice({
          ctin: extracted.ctin,
          pos: extracted.pos,
          supplierStateCode: biz.stateCode || '06',
          grandTotal: extracted.totals.grandTotal,
        });

        // 3. Validate (§2.6)
        const validation = validateInvoice({
          inum: extracted.inum,
          idt: extracted.idt,
          ctin: extracted.ctin,
          section,
          turnoverSlab: biz.turnoverSlab || 'UNDER_5CR',
          items: extracted.items,
          totals: extracted.totals,
          docAiConfidence: extracted.docAiConfidence,
        });

        const invId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const invDoc = {
          id: invId,
          bizId,
          period,
          kind,
          inum: extracted.inum,
          idt: extracted.idt,
          ctin: extracted.ctin,
          ctinName: extracted.ctinName,
          supplierGstin: extracted.ctin,
          supplierName: extracted.ctinName,
          pos: extracted.pos,
          rchrg: 'N',
          invTyp: 'R',
          section,
          items: extracted.items,
          totals: extracted.totals,
          status: validation.status,
          flag: validation.flags[0] || null,
          flags: validation.flags,
          docAiConfidence: extracted.docAiConfidence,
          confidences: extracted.confidences,
          correctedByUser: false,
          confirmed: validation.status === 'green',
          source: {
            filename: file.name,
            docAiConfidence: extracted.docAiConfidence,
            parsedVia: extracted.parsedVia,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to memoryStore
        memoryStore.invoices.set(invId, invDoc);
        if (kind === 'purchase') {
          memoryStore.purchases.set(invId, invDoc);
        }
        processedItems.push(invDoc);

        // Save to Firestore if available
        const db = getFirestoreDb();
        if (db) {
          try {
            const colName = kind === 'sales' ? 'salesInvoices' : 'purchaseInvoices';
            await db
              .collection('businesses')
              .doc(bizId)
              .collection('periods')
              .doc(period)
              .collection(colName)
              .doc(invId)
              .set(invDoc);
          } catch (e) {
            console.warn('Firestore invoice background write warning:', e);
          }
        }
      }
    }

    // Refresh Period Snapshot
    const periodKey = `${bizId}_${period}`;
    let periodDoc = memoryStore.periods.get(periodKey);
    if (!periodDoc) {
      periodDoc = {
        id: period,
        bizId,
        period,
        status: { f1: 'done', f2: 'idle', f3: 'idle' },
        totals: { salesTxval: 0, salesTax: 0, purchaseTxval: 0, itcAvailable2B: 0, itcClaimed: 0 },
        triangle: { liabilityGap: 0, itcGap: 0 },
        moneyAtRisk: 0,
        matchScore: 100,
        updatedAt: new Date().toISOString(),
      };
    }

    let pSalesTxval = 0;
    let pSalesTax = 0;
    for (const inv of memoryStore.invoices.values()) {
      if (inv.bizId === bizId && inv.period === period && inv.kind === 'sales') {
        pSalesTxval += inv.totals?.txval || 0;
        pSalesTax += inv.totals?.totalTax || 0;
      }
    }
    periodDoc.totals.salesTxval = pSalesTxval;
    periodDoc.totals.salesTax = pSalesTax;
    if (kind === 'sales') {
      periodDoc.status.f1 = 'done';
    } else if (kind === 'purchase' || kind === 'gstr2b') {
      periodDoc.status.f2 = 'in_progress';
    }
    periodDoc.updatedAt = new Date().toISOString();
    memoryStore.periods.set(periodKey, periodDoc);

    // Mark job done
    job.status = 'done';
    job.progress = 100;
    job.filesProcessed = totalFiles;
    job.processedCount = processedItems.length;
    job.updatedAt = new Date().toISOString();
    memoryStore.jobs.set(jobId, job);
  } catch (err: any) {
    console.error('Job processing failed:', err);
    job.status = 'error';
    job.error = err.message || 'Processing failed';
    job.updatedAt = new Date().toISOString();
    memoryStore.jobs.set(jobId, job);
  }
}
