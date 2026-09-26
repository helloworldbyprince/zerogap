import ExcelJS from 'exceljs';
import { CONFIG } from './config';

export interface Gstr2bRecord {
  id: string;
  bizId: string;
  period: string;
  supplierGstin: string;
  supplierName: string;
  inum: string;
  idt: string; // DD-MM-YYYY
  invVal: number;
  pos: string;
  rt: number;
  txval: number;
  iamt: number;
  camt: number;
  samt: number;
  csamt: number;
  itcAvailable: boolean;
  reason?: string;
  filingDate?: string;
  source: 'UPLOAD' | 'SEED';
}

/**
 * Parse GSTR-2B file from Excel buffer or CSV text
 */
export async function parseGstr2bFile(
  buffer: Buffer,
  filename: string,
  bizId: string,
  period: string
): Promise<Gstr2bRecord[]> {
  const records: Gstr2bRecord[] = [];
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith('.csv')) {
    // Parse CSV
    const text = buffer.toString('utf-8');
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header lines
      if (line.toLowerCase().includes('gstin') || line.toLowerCase().includes('invoice number') || i === 0) {
        continue;
      }

      // Basic CSV splitter respecting simple quotes
      const cols = line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
      if (cols.length >= 7) {
        const gstin = (cols[0] || '').toUpperCase();
        const supplierName = cols[1] || 'Registered Supplier';
        const inum = cols[2] || '';
        const idt = cols[4] || cols[3] || '15-09-2026';
        const invVal = parseFloat(cols[5] || '0') || 0;
        const pos = (cols[6] || '06').slice(0, 2);
        const rt = parseFloat(cols[8] || '18') || 18;
        const txval = parseFloat(cols[9] || '0') || (invVal > 0 ? Math.round(invVal / 1.18) : 0);
        const iamt = parseFloat(cols[10] || '0') || 0;
        const camt = parseFloat(cols[11] || '0') || 0;
        const samt = parseFloat(cols[12] || '0') || 0;

        if (inum) {
          records.push({
            id: `gstr2b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            bizId,
            period,
            supplierGstin: gstin,
            supplierName,
            inum,
            idt,
            invVal: invVal || (txval + iamt + camt + samt),
            pos,
            rt,
            txval,
            iamt,
            camt,
            samt,
            csamt: 0,
            itcAvailable: true,
            source: 'UPLOAD',
          });
        }
      }
    }
    return records;
  }

  // Parse Excel (.xlsx / .xls)
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    // Look for B2B or active sheet in 2B workbook
    const sheet =
      workbook.getWorksheet('B2B') ||
      workbook.getWorksheet('b2b') ||
      workbook.getWorksheet('B2B Invoices') ||
      workbook.worksheets[0];

    if (sheet) {
      sheet.eachRow((row, rowNumber) => {
        // Skip header rows (GSTN portal 2B usually has 4-5 title rows)
        if (rowNumber <= 4) return;

        const val1 = String(row.getCell(1).value || '').trim();
        // If row is a subtotal or empty, skip
        if (!val1 || val1.toLowerCase().includes('total') || val1.toLowerCase().includes('gstin')) {
          return;
        }

        const gstin = val1.toUpperCase();
        const supplierName = String(row.getCell(2).value || '').trim();
        const inum = String(row.getCell(3).value || '').trim();
        const idt = String(row.getCell(4).value || '').trim();
        const invVal = parseFloat(String(row.getCell(5).value || '0')) || 0;
        const pos = String(row.getCell(6).value || '06').substring(0, 2);
        const rt = parseFloat(String(row.getCell(9).value || '18')) || 18;
        const txval = parseFloat(String(row.getCell(10).value || '0')) || 0;
        const iamt = parseFloat(String(row.getCell(11).value || '0')) || 0;
        const camt = parseFloat(String(row.getCell(12).value || '0')) || 0;
        const samt = parseFloat(String(row.getCell(13).value || '0')) || 0;

        if (inum && (txval > 0 || invVal > 0)) {
          records.push({
            id: `gstr2b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            bizId,
            period,
            supplierGstin: gstin,
            supplierName: supplierName || 'Registered Supplier',
            inum,
            idt: idt || '15-09-2026',
            invVal: invVal || (txval + iamt + camt + samt),
            pos,
            rt,
            txval,
            iamt,
            camt,
            samt,
            csamt: 0,
            itcAvailable: true,
            source: 'UPLOAD',
          });
        }
      });
    }
  } catch (err: any) {
    console.warn('GSTR-2B Excel parse error, fallback to empty:', err.message);
  }

  return records;
}
