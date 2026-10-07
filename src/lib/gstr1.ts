import ExcelJS from 'exceljs';
import { CONFIG } from './config';
import { lookupHsn } from './hsn';

export interface Gstr1Summary {
  gstin: string;
  fp: string;
  gt: number;
  b2bCount: number;
  b2clCount: number;
  b2csCount: number;
  totalTaxable: number;
  totalTax: number;
}

/**
 * Format filing period from YYYYMM (e.g. 202609) to official GSTN MMYYYY (e.g. 092026)
 */
export function formatPeriodToFp(periodCode: string): string {
  if (!/^\d{4}(0[1-9]|1[0-2])$/.test(periodCode)) {
    throw new Error('Filing period must be YYYYMM');
  }
  const year = periodCode.substring(0, 4);
  const month = periodCode.substring(4, 6);
  return `${month}${year}`;
}

/**
 * §2.4 GSTR-1 JSON schema (offline-tool format — generate EXACTLY this)
 */
export function buildGstr1Json(invoices: any[], business: any, period: string) {
  const gstin = business?.gstin || '06ABCDE1234F1Z5';
  const supplierState = business?.stateCode || gstin.substring(0, 2) || '06';
  const fp = formatPeriodToFp(period || CONFIG.demo.periodCode);

  let totalTaxable = 0;
  let totalTax = 0;

  // 1. Process B2B Invoices (grouped by counterparty ctin)
  const b2bMap = new Map<string, any[]>();
  // 2. Process B2CL Invoices (grouped by pos)
  const b2clMap = new Map<string, any[]>();
  // 3. Process B2CS Invoices (aggregated by pos + rate)
  const b2csMap = new Map<string, { pos: string; rt: number; sply_ty: string; txval: number; iamt: number; camt: number; samt: number; csamt: number }>();
  // 4. Process HSN Summary (aggregated by HSN code)
  const hsnMap = new Map<string, { hsn_sc: string; desc: string; uqc: string; qty: number; txval: number; iamt: number; camt: number; samt: number; csamt: number }>();

  // Document range tracker
  const inums: string[] = [];

  for (const inv of invoices) {
    const itm = inv.items?.[0] || {
      hsn: '8471',
      desc: 'Computer Hardware',
      qty: 1,
      uqc: 'NOS',
      txval: inv.totals?.txval || 0,
      rt: 18,
      iamt: inv.totals?.iamt || 0,
      camt: inv.totals?.camt || 0,
      samt: inv.totals?.samt || 0,
      csamt: 0,
    };

    totalTaxable += itm.txval;
    totalTax += (itm.iamt + itm.camt + itm.samt);
    if (inv.inum) inums.push(inv.inum);

    const pos = inv.pos || (inv.ctin ? inv.ctin.substring(0, 2) : supplierState);
    const isInterState = pos !== supplierState;

    // A. B2B
    if (inv.section === 'B2B' && inv.ctin) {
      const ctin = inv.ctin.trim().toUpperCase();
      if (!b2bMap.has(ctin)) {
        b2bMap.set(ctin, []);
      }
      b2bMap.get(ctin)!.push({
        inum: inv.inum,
        idt: inv.idt,
        val: Number((inv.totals?.grandTotal || (itm.txval + itm.iamt + itm.camt + itm.samt)).toFixed(2)),
        pos,
        rchrg: inv.rchrg || 'N',
        inv_typ: inv.invTyp || 'R',
        itms: [
          {
            num: 1,
            itm_det: {
              rt: itm.rt,
              txval: Number(itm.txval.toFixed(2)),
              iamt: Number(itm.iamt.toFixed(2)),
              camt: Number(itm.camt.toFixed(2)),
              samt: Number(itm.samt.toFixed(2)),
              csamt: Number((itm.csamt || 0).toFixed(2)),
            },
          },
        ],
      });
    }

    // B. B2CL (Inter-state unregistered > threshold)
    else if (inv.section === 'B2CL') {
      if (!b2clMap.has(pos)) {
        b2clMap.set(pos, []);
      }
      b2clMap.get(pos)!.push({
        inum: inv.inum,
        idt: inv.idt,
        val: Number((inv.totals?.grandTotal || (itm.txval + itm.iamt)).toFixed(2)),
        itms: [
          {
            num: 1,
            itm_det: {
              rt: itm.rt,
              txval: Number(itm.txval.toFixed(2)),
              iamt: Number(itm.iamt.toFixed(2)),
              csamt: Number((itm.csamt || 0).toFixed(2)),
            },
          },
        ],
      });
    }

    // C. B2CS (Small consumer - aggregated by POS x Rate)
    else {
      const key = `${pos}_${itm.rt}`;
      const existing = b2csMap.get(key) || {
        pos,
        rt: itm.rt,
        sply_ty: isInterState ? 'INTER' : 'INTRA',
        txval: 0,
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0,
      };

      existing.txval += itm.txval;
      existing.iamt += itm.iamt;
      existing.camt += itm.camt;
      existing.samt += itm.samt;
      existing.csamt += (itm.csamt || 0);
      b2csMap.set(key, existing);
    }

    // D. Aggregate into HSN summary
    const cleanHsn = (itm.hsn || '8471').replace(/\D/g, '');
    const master = lookupHsn(cleanHsn);
    const hsnDesc = master?.description || itm.desc || 'General Goods';

    const hsnExisting = hsnMap.get(cleanHsn) || {
      hsn_sc: cleanHsn,
      desc: hsnDesc,
      uqc: itm.uqc || 'NOS',
      qty: 0,
      txval: 0,
      iamt: 0,
      camt: 0,
      samt: 0,
      csamt: 0,
    };

    hsnExisting.qty += (itm.qty || 1);
    hsnExisting.txval += itm.txval;
    hsnExisting.iamt += itm.iamt;
    hsnExisting.camt += itm.camt;
    hsnExisting.samt += itm.samt;
    hsnExisting.csamt += (itm.csamt || 0);
    hsnMap.set(cleanHsn, hsnExisting);
  }

  // Format B2B output
  const b2bOutput: any[] = [];
  for (const [ctin, invList] of b2bMap.entries()) {
    b2bOutput.push({
      ctin,
      inv: invList,
    });
  }

  // Format B2CL output
  const b2clOutput: any[] = [];
  for (const [pos, invList] of b2clMap.entries()) {
    b2clOutput.push({
      pos,
      inv: invList,
    });
  }

  // Format B2CS output
  const b2csOutput: any[] = [];
  for (const item of b2csMap.values()) {
    b2csOutput.push({
      sply_ty: item.sply_ty,
      pos: item.pos,
      typ: 'OE',
      rt: item.rt,
      txval: Number(item.txval.toFixed(2)),
      iamt: Number(item.iamt.toFixed(2)),
      camt: Number(item.camt.toFixed(2)),
      samt: Number(item.samt.toFixed(2)),
      csamt: Number(item.csamt.toFixed(2)),
    });
  }

  // Format HSN output
  const hsnOutput: any[] = [];
  for (const hsnItem of hsnMap.values()) {
    hsnOutput.push({
      hsn_sc: hsnItem.hsn_sc,
      desc: hsnItem.desc,
      uqc: hsnItem.uqc,
      qty: hsnItem.qty,
      txval: Number(hsnItem.txval.toFixed(2)),
      iamt: Number(hsnItem.iamt.toFixed(2)),
      camt: Number(hsnItem.camt.toFixed(2)),
      samt: Number(hsnItem.samt.toFixed(2)),
      csamt: Number(hsnItem.csamt.toFixed(2)),
    });
  }

  const grossTurnover = Number((totalTaxable + totalTax).toFixed(2));

  return {
    gstin,
    fp,
    gt: grossTurnover,
    b2b: b2bOutput,
    b2cl: b2clOutput,
    b2cs: b2csOutput,
    hsn: {
      data: hsnOutput,
    },
  };
}

/**
 * Build official GSTR-1 Excel Workbook with sheets: b2b, b2cl, b2cs, hsn, docs
 */
export async function buildGstr1Excel(invoices: any[], business: any, period: string): Promise<Buffer> {
  const gstin = business?.gstin || '06ABCDE1234F1Z5';
  const supplierState = business?.stateCode || gstin.substring(0, 2) || '06';
  const fp = formatPeriodToFp(period || CONFIG.demo.periodCode);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = CONFIG.app.name;
  workbook.created = new Date();

  // Helper styles
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF161B22' },
  };
  const headerFont = {
    name: 'Arial',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  const dataFont = {
    name: 'Arial',
    size: 9,
  };

  // 1. Sheet: Summary / Instructions
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Parameter', key: 'param', width: 28 },
    { header: 'Value', key: 'val', width: 40 },
  ];
  summarySheet.getRow(1).font = headerFont;
  summarySheet.getRow(1).fill = headerFill;

  summarySheet.addRow({ param: 'GSTIN of Taxpayer', val: gstin });
  summarySheet.addRow({ param: 'Legal Business Name', val: business?.name || CONFIG.demo.businessName });
  summarySheet.addRow({ param: 'Tax Period (Filing Period)', val: fp });
  summarySheet.addRow({ param: 'Total Invoices Uploaded', val: invoices.length });
  summarySheet.addRow({ param: 'Total Taxable Value (₹)', val: invoices.reduce((s, i) => s + (i.totals?.txval || 0), 0) });
  summarySheet.addRow({ param: 'Total Tax Liability (₹)', val: invoices.reduce((s, i) => s + (i.totals?.totalTax || 0), 0) });
  summarySheet.addRow({ param: 'Generated By', val: `${CONFIG.app.name} (${CONFIG.app.tagline})` });

  // 2. Sheet: b2b
  const b2bSheet = workbook.addWorksheet('b2b');
  b2bSheet.columns = [
    { header: 'GSTIN/UIN of Recipient', key: 'ctin', width: 18 },
    { header: 'Receiver Name', key: 'ctinName', width: 28 },
    { header: 'Invoice Number', key: 'inum', width: 16 },
    { header: 'Invoice date', key: 'idt', width: 14 },
    { header: 'Invoice Value', key: 'val', width: 14 },
    { header: 'Place Of Supply', key: 'pos', width: 16 },
    { header: 'Reverse Charge', key: 'rchrg', width: 14 },
    { header: 'Applicable % of Tax Rate', key: 'appr', width: 24 },
    { header: 'Invoice Type', key: 'inv_typ', width: 14 },
    { header: 'E-Commerce GSTIN', key: 'etin', width: 18 },
    { header: 'Rate', key: 'rt', width: 10 },
    { header: 'Taxable Value', key: 'txval', width: 16 },
    { header: 'Cess Amount', key: 'csamt', width: 14 },
  ];
  b2bSheet.getRow(1).font = headerFont;
  b2bSheet.getRow(1).fill = headerFill;

  // 3. Sheet: b2cl
  const b2clSheet = workbook.addWorksheet('b2cl');
  b2clSheet.columns = [
    { header: 'Invoice Number', key: 'inum', width: 16 },
    { header: 'Invoice date', key: 'idt', width: 14 },
    { header: 'Invoice Value', key: 'val', width: 14 },
    { header: 'Place Of Supply', key: 'pos', width: 16 },
    { header: 'Applicable % of Tax Rate', key: 'appr', width: 24 },
    { header: 'Rate', key: 'rt', width: 10 },
    { header: 'Taxable Value', key: 'txval', width: 16 },
    { header: 'Cess Amount', key: 'csamt', width: 14 },
    { header: 'E-Commerce GSTIN', key: 'etin', width: 18 },
  ];
  b2clSheet.getRow(1).font = headerFont;
  b2clSheet.getRow(1).fill = headerFill;

  // 4. Sheet: b2cs
  const b2csSheet = workbook.addWorksheet('b2cs');
  b2csSheet.columns = [
    { header: 'Type', key: 'sply_ty', width: 14 },
    { header: 'Place Of Supply', key: 'pos', width: 16 },
    { header: 'Applicable % of Tax Rate', key: 'appr', width: 24 },
    { header: 'Rate', key: 'rt', width: 10 },
    { header: 'Taxable Value', key: 'txval', width: 16 },
    { header: 'Cess Amount', key: 'csamt', width: 14 },
    { header: 'E-Commerce GSTIN', key: 'etin', width: 18 },
  ];
  b2csSheet.getRow(1).font = headerFont;
  b2csSheet.getRow(1).fill = headerFill;

  // 5. Sheet: hsn
  const hsnSheet = workbook.addWorksheet('hsn');
  hsnSheet.columns = [
    { header: 'HSN', key: 'hsn_sc', width: 14 },
    { header: 'Description', key: 'desc', width: 34 },
    { header: 'UQC', key: 'uqc', width: 10 },
    { header: 'Total Quantity', key: 'qty', width: 14 },
    { header: 'Total Value', key: 'val', width: 16 },
    { header: 'Taxable Value', key: 'txval', width: 16 },
    { header: 'Integrated Tax Amount', key: 'iamt', width: 22 },
    { header: 'Central Tax Amount', key: 'camt', width: 20 },
    { header: 'State/UT Tax Amount', key: 'samt', width: 20 },
    { header: 'Cess Amount', key: 'csamt', width: 14 },
  ];
  hsnSheet.getRow(1).font = headerFont;
  hsnSheet.getRow(1).fill = headerFill;

  // 6. Sheet: docs
  const docsSheet = workbook.addWorksheet('docs');
  docsSheet.columns = [
    { header: 'Nature of Document', key: 'doc_typ', width: 32 },
    { header: 'Sr. No. From', key: 'from', width: 16 },
    { header: 'Sr. No. To', key: 'to', width: 16 },
    { header: 'Total Number', key: 'totnum', width: 14 },
    { header: 'Cancelled', key: 'canc', width: 12 },
    { header: 'Net Issued', key: 'net_issue', width: 14 },
  ];
  docsSheet.getRow(1).font = headerFont;
  docsSheet.getRow(1).fill = headerFill;

  // Populate data rows from generated JSON structure
  const gstr1Data = buildGstr1Json(invoices, business, period);

  // Fill B2B rows
  for (const b2bGroup of gstr1Data.b2b) {
    for (const inv of b2bGroup.inv) {
      const itm = inv.itms?.[0]?.itm_det || {};
      const invRecord = invoices.find((i) => i.inum === inv.inum);
      b2bSheet.addRow({
        ctin: b2bGroup.ctin,
        ctinName: invRecord?.ctinName || '',
        inum: inv.inum,
        idt: inv.idt,
        val: inv.val,
        pos: `${inv.pos}-${getPosStateName(inv.pos)}`,
        rchrg: inv.rchrg,
        appr: '',
        inv_typ: 'Regular',
        etin: '',
        rt: itm.rt,
        txval: itm.txval,
        csamt: itm.csamt || 0,
      });
    }
  }

  // Fill B2CL rows
  for (const b2clGroup of gstr1Data.b2cl) {
    for (const inv of b2clGroup.inv) {
      const itm = inv.itms?.[0]?.itm_det || {};
      b2clSheet.addRow({
        inum: inv.inum,
        idt: inv.idt,
        val: inv.val,
        pos: `${b2clGroup.pos}-${getPosStateName(b2clGroup.pos)}`,
        appr: '',
        rt: itm.rt,
        txval: itm.txval,
        csamt: itm.csamt || 0,
        etin: '',
      });
    }
  }

  // Fill B2CS rows
  for (const b2cs of gstr1Data.b2cs) {
    b2csSheet.addRow({
      sply_ty: b2cs.sply_ty === 'INTER' ? 'Inter-State' : 'Intra-State',
      pos: `${b2cs.pos}-${getPosStateName(b2cs.pos)}`,
      appr: '',
      rt: b2cs.rt,
      txval: b2cs.txval,
      csamt: b2cs.csamt || 0,
      etin: '',
    });
  }

  // Fill HSN rows
  for (const hsn of gstr1Data.hsn.data) {
    const totalVal = hsn.txval + hsn.iamt + hsn.camt + hsn.samt + hsn.csamt;
    hsnSheet.addRow({
      hsn_sc: hsn.hsn_sc,
      desc: hsn.desc,
      uqc: hsn.uqc,
      qty: hsn.qty,
      val: Number(totalVal.toFixed(2)),
      txval: hsn.txval,
      iamt: hsn.iamt,
      camt: hsn.camt,
      samt: hsn.samt,
      csamt: hsn.csamt,
    });
  }

  // Fill Docs rows
  const invoiceNumbers = invoices.map((invoice) => invoice.inum).filter(Boolean).sort();
  const docInfo = {
    from: invoiceNumbers[0] || '',
    to: invoiceNumbers[invoiceNumbers.length - 1] || '',
    totnum: invoiceNumbers.length,
    canc: 0,
    net_issue: invoiceNumbers.length,
  };
  docsSheet.addRow({
    doc_typ: 'Invoices for outward supply',
    from: docInfo.from,
    to: docInfo.to,
    totnum: docInfo.totnum,
    canc: docInfo.canc,
    net_issue: docInfo.net_issue,
  });

  // Apply styling
  [summarySheet, b2bSheet, b2clSheet, b2csSheet, hsnSheet, docsSheet].forEach((sheet) => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.font = dataFont;
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function getPosStateName(posCode: string): string {
  const stateMap: Record<string, string> = {
    '01': 'Jammu & Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '19': 'West Bengal',
    '24': 'Gujarat',
    '27': 'Maharashtra',
    '29': 'Karnataka',
    '33': 'Tamil Nadu',
    '36': 'Telangana',
  };
  return stateMap[posCode] || 'Other State';
}

/**
 * Validation gate before export (§2.6)
 * Blocks export on unacknowledged red errors; warns on advisories.
 */
export function validateGstr1Export(invoices: any[]) {
  const redInvoices = invoices.filter((i) => i.status === 'red');
  const amberInvoices = invoices.filter((i) => i.status === 'amber');

  const blockingCount = redInvoices.length;
  const warningCount = amberInvoices.length;

  return {
    canExport: blockingCount === 0,
    blockingCount,
    warningCount,
    redInvoices: redInvoices.map((i) => ({
      inum: i.inum,
      message: i.flag?.message || 'Blocking validation error',
    })),
    warnings: amberInvoices.map((i) => ({
      inum: i.inum,
      message: i.flag?.message || 'Advisory warning',
    })),
  };
}
