import { getApps, getApp, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { CONFIG } from '@/lib/config';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK safely
function initAdmin(): App | null {
  const apps = getApps();
  if (apps.length > 0 && apps[0]) {
    return apps[0];
  }

  // Clear non-existent credentials path to avoid ENOENT errors in Google Auth
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const projectId = process.env.GCP_PROJECT_ID || 'zerogap-509816';
  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
      });
    } catch (e) {
      console.warn('Failed parsing service-account.json, falling back to default:', e);
    }
  }

  try {
    return initializeApp({
      projectId: projectId,
    });
  } catch (e) {
    return null;
  }
}

const adminApp = initAdmin();

// Keep one store across Next.js route bundles and hot reloads. A module-local
// object causes /api/uploads and /api/jobs/:id to see different Maps in dev.
type MemoryStore = {
  businesses: Map<string, any>;
  periods: Map<string, any>;
  jobs: Map<string, any>;
  invoices: Map<string, any>;
  purchases: Map<string, any>;
  gstr2b: Map<string, any>;
  reco: Map<string, any>;
};

const processGlobal = globalThis as typeof globalThis & { __zeroGapMemoryStore?: MemoryStore };
const memoryStore: MemoryStore = processGlobal.__zeroGapMemoryStore ?? {
  businesses: new Map<string, any>(),
  periods: new Map<string, any>(),
  jobs: new Map<string, any>(),
  invoices: new Map<string, any>(),
  purchases: new Map<string, any>(),
  gstr2b: new Map<string, any>(),
  reco: new Map<string, any>(),
};
processGlobal.__zeroGapMemoryStore = memoryStore;

// Seed demo business & period in memory as guaranteed fallback
const DEMO_BIZ_ID = 'biz_sharma_traders_demo';
const DEMO_PERIOD = CONFIG.demo.periodCode; // '202609'

memoryStore.businesses.set(DEMO_BIZ_ID, {
  id: DEMO_BIZ_ID,
  name: CONFIG.demo.businessName,
  gstin: '06ABCDE1234F1Z5',
  turnoverSlab: 'UNDER_5CR',
  stateCode: '06',
  ownerUid: 'demo_user',
  createdAt: new Date().toISOString(),
});

memoryStore.periods.set(`${DEMO_BIZ_ID}_${DEMO_PERIOD}`, {
  id: DEMO_PERIOD,
  bizId: DEMO_BIZ_ID,
  period: DEMO_PERIOD,
  status: { f1: 'done', f2: 'done', f3: 'done' },
  totals: {
    salesTxval: CONFIG.demo.salesTaxableValue,
    salesTax: CONFIG.demo.salesTax,
    purchaseTxval: 1433100,
    itcAvailable2B: CONFIG.demo.itcAvailable2B,
    itcClaimed: CONFIG.demo.itcClaimed3B,
  },
  triangle: {
    liabilityGap: 0,
    itcGap: CONFIG.demo.creditCheckGap,
  },
  moneyAtRisk: CONFIG.demo.moneyAtRisk,
  matchScore: CONFIG.demo.matchScore,
  updatedAt: new Date().toISOString(),
});

// Seed 24 sales invoices for Sharma Traders (Demo)
function seedDemoInvoices() {
  const seedInvs = [
    {
      id: 'inv_demo_001',
      inum: 'INV-001',
      idt: '15-09-2026',
      ctin: '07ABCDE1234F1Z5',
      ctinName: 'Delhi Tech Labs Pvt Ltd',
      pos: '07',
      section: 'B2B',
      hsn: '8471',
      desc: 'Workstations & Peripherals',
      txval: 10000,
      rt: 18,
      iamt: 1800,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.98,
      confidences: { inum: 0.99, idt: 0.98, ctin: 0.97, hsn: 0.98, txval: 0.99 },
    },
    {
      id: 'inv_demo_002',
      inum: 'INV-002',
      idt: '16-09-2026',
      ctin: '06BCDEF2345G2Z6',
      ctinName: 'Gurugram Systems LLP',
      pos: '06',
      section: 'B2B',
      hsn: '8517',
      desc: 'Network Routers & Hardware',
      txval: 25000,
      rt: 18,
      iamt: 0,
      camt: 2250,
      samt: 2250,
      status: 'green',
      docAiConfidence: 0.96,
      confidences: { inum: 0.98, idt: 0.97, ctin: 0.96, hsn: 0.95, txval: 0.98 },
    },
    {
      id: 'inv_demo_003',
      inum: 'INV-003',
      idt: '16-09-2026',
      ctin: '07CDEFG3456H3Z7',
      ctinName: 'Apex Data Services',
      pos: '07',
      section: 'B2B',
      hsn: '9983',
      desc: 'IT Infrastructure Consulting',
      txval: 40000,
      rt: 18,
      iamt: 7200,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.95,
      confidences: { inum: 0.97, idt: 0.96, ctin: 0.95, hsn: 0.94, txval: 0.97 },
    },
    {
      id: 'inv_demo_004',
      inum: 'INV-004',
      idt: '17-09-2026',
      ctin: '',
      ctinName: 'Counter Cash Sale #1',
      pos: '06',
      section: 'B2CS',
      hsn: '8471',
      desc: 'Computer Accessories',
      txval: 5000,
      rt: 18,
      iamt: 0,
      camt: 450,
      samt: 450,
      status: 'green',
      docAiConfidence: 0.92,
      confidences: { inum: 0.95, idt: 0.94, hsn: 0.92, txval: 0.95 },
    },
    {
      id: 'inv_demo_005',
      inum: 'INV-005',
      idt: '17-09-2026',
      ctin: '06DEFGH4567J4Z8',
      ctinName: 'Panchkula Steel Works',
      pos: '06',
      section: 'B2B',
      hsn: '7326',
      desc: 'Fabricated Server Racks',
      txval: 15000,
      rt: 18,
      iamt: 0,
      camt: 1350,
      samt: 1350,
      status: 'green',
      docAiConfidence: 0.97,
      confidences: { inum: 0.98, idt: 0.97, ctin: 0.98, hsn: 0.96, txval: 0.98 },
    },
    {
      id: 'inv_demo_006',
      inum: 'INV-006',
      idt: '18-09-2026',
      ctin: '07EFGHI5678K5Z9',
      ctinName: 'Noida Software Hub',
      pos: '07',
      section: 'B2B',
      hsn: '8471',
      desc: 'Desktop Computer Units',
      txval: 30000,
      rt: 18,
      iamt: 5400,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.94,
      confidences: { inum: 0.96, idt: 0.95, ctin: 0.94, hsn: 0.93, txval: 0.96 },
    },
    {
      id: 'inv_demo_007',
      inum: 'INV-007',
      idt: '18-09-2026',
      ctin: '07FGHIJ6789L6Z1',
      ctinName: 'Apex Infotech Solutions',
      pos: '07',
      section: 'B2B',
      hsn: '8471',
      desc: 'Storage Adapters & Peripherals',
      txval: 5000,
      rt: 12, // Billed 12%, usually 18%!
      iamt: 600,
      camt: 0,
      samt: 0,
      status: 'amber',
      flag: {
        code: 'RATE_MISMATCH',
        pillLabel: 'RATE?',
        message: 'Billed 12%, HSN 8471 usually 18% — check before filing',
      },
      docAiConfidence: 0.91,
      confidences: { inum: 0.95, idt: 0.94, ctin: 0.93, hsn: 0.91, txval: 0.94 },
    },
    {
      id: 'inv_demo_008',
      inum: 'INV-008',
      idt: '19-09-2026',
      ctin: '06GHIJK7890M7Z2',
      ctinName: 'Karnal Digital Store',
      pos: '06',
      section: 'B2B',
      hsn: '8517',
      desc: 'VoIP Telephony Equipment',
      txval: 20000,
      rt: 18,
      iamt: 0,
      camt: 1800,
      samt: 1800,
      status: 'green',
      docAiConfidence: 0.96,
      confidences: { inum: 0.97, idt: 0.96, ctin: 0.97, hsn: 0.95, txval: 0.97 },
    },
    {
      id: 'inv_demo_009',
      inum: 'INV-009',
      idt: '20-09-2026',
      ctin: '07HIJKL8901N8Z3',
      ctinName: 'Connaught Enterprise Corp',
      pos: '07',
      section: 'B2B',
      hsn: '8471',
      desc: 'Laser Printers & Scanners',
      txval: 35000,
      rt: 18,
      iamt: 6300,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.97,
      confidences: { inum: 0.98, idt: 0.97, ctin: 0.97, hsn: 0.96, txval: 0.98 },
    },
    {
      id: 'inv_demo_010',
      inum: 'INV-010',
      idt: '21-09-2026',
      ctin: '06IJKLM9012P9Z4',
      ctinName: 'Faridabad Auto Tooling',
      pos: '06',
      section: 'B2B',
      hsn: '8443',
      desc: 'Commercial Print Spares',
      txval: 50000,
      rt: 18,
      iamt: 0,
      camt: 4500,
      samt: 4500,
      status: 'green',
      docAiConfidence: 0.95,
      confidences: { inum: 0.96, idt: 0.95, ctin: 0.95, hsn: 0.94, txval: 0.96 },
    },
    {
      id: 'inv_demo_011',
      inum: 'INV-011',
      idt: '21-09-2026',
      ctin: '07JKLMN0123Q1Z5',
      ctinName: 'South Ext Printers',
      pos: '07',
      section: 'B2B',
      hsn: '4820',
      desc: 'Continuous Computer Stationery',
      txval: 18000,
      rt: 18,
      iamt: 3240,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.96,
      confidences: { inum: 0.97, idt: 0.96, ctin: 0.96, hsn: 0.95, txval: 0.97 },
    },
    {
      id: 'inv_demo_012',
      inum: 'INV-012',
      idt: '22-09-2026',
      ctin: '07KLMNO1234R2Z6',
      ctinName: 'Global Logistics Haryana',
      pos: '07',
      section: 'B2B',
      hsn: '996', // only 3 digits! Invalid HSN length
      desc: 'Express Courier & Handling',
      txval: 12000,
      rt: 18,
      iamt: 2160,
      camt: 0,
      samt: 0,
      status: 'red',
      flag: {
        code: 'HSN_INVALID_DIGITS',
        pillLabel: 'HSN?',
        message: 'HSN 996 has 3 digits. Min 4 digits required for turnover under ₹5cr.',
      },
      docAiConfidence: 0.89,
      confidences: { inum: 0.94, idt: 0.93, ctin: 0.94, hsn: 0.72, txval: 0.95 },
    },
    {
      id: 'inv_demo_013',
      inum: 'INV-013',
      idt: '22-09-2026',
      ctin: '06LMNOP2345S3Z7',
      ctinName: 'Panipat Fabrications',
      pos: '06',
      section: 'B2B',
      hsn: '9403',
      desc: 'Modular Workstation Tables',
      txval: 28000,
      rt: 18,
      iamt: 0,
      camt: 2520,
      samt: 2520,
      status: 'green',
      docAiConfidence: 0.94,
      confidences: { inum: 0.96, idt: 0.95, ctin: 0.96, hsn: 0.93, txval: 0.96 },
    },
    {
      id: 'inv_demo_014',
      inum: 'INV-014',
      idt: '23-09-2026',
      ctin: '07MNOPQ3456T4Z8',
      ctinName: 'Dwarka Cyber Technologies',
      pos: '07',
      section: 'B2B',
      hsn: '8471',
      desc: 'Server RAM & SSD Upgrades',
      txval: 22000,
      rt: 18,
      iamt: 3960,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.98,
      confidences: { inum: 0.99, idt: 0.98, ctin: 0.98, hsn: 0.97, txval: 0.99 },
    },
    {
      id: 'inv_demo_015',
      inum: 'INV-015',
      idt: '23-09-2026',
      ctin: '06NOPQR4567U5Z9',
      ctinName: 'Hisar Industrial Spares',
      pos: '06',
      section: 'B2B',
      hsn: '8471',
      desc: 'Industrial Panel PC & Mounts',
      txval: 45000,
      rt: 18,
      iamt: 0,
      camt: 4050,
      samt: 4050,
      status: 'green',
      docAiConfidence: 0.97,
      confidences: { inum: 0.98, idt: 0.97, ctin: 0.98, hsn: 0.96, txval: 0.98 },
    },
    {
      id: 'inv_demo_016',
      inum: 'INV-016',
      idt: '24-09-2026',
      ctin: '07OPQRS5678V6Z1',
      ctinName: 'Janakpuri Communications',
      pos: '07',
      section: 'B2B',
      hsn: '8517',
      desc: 'Optical Fiber Modems',
      txval: 32000,
      rt: 18,
      iamt: 5760,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.96,
      confidences: { inum: 0.97, idt: 0.96, ctin: 0.97, hsn: 0.95, txval: 0.97 },
    },
    {
      id: 'inv_demo_017',
      inum: 'INV-017',
      idt: '24-09-2026',
      ctin: '06PQRST6789W7Z2',
      ctinName: 'Rohtak Engineering Corp',
      pos: '06',
      section: 'B2B',
      hsn: '8471',
      desc: 'Enterprise Compute Rack',
      txval: 60000,
      rt: 18,
      iamt: 0,
      camt: 5400,
      samt: 5400,
      status: 'green',
      docAiConfidence: 0.97,
      confidences: { inum: 0.98, idt: 0.97, ctin: 0.98, hsn: 0.96, txval: 0.98 },
    },
    {
      id: 'inv_demo_018',
      inum: 'INV-018',
      idt: '25-09-2026',
      ctin: '07QRSTU7890X8Z3',
      ctinName: 'Saket Retail Chains Ltd',
      pos: '07',
      section: 'B2B',
      hsn: '8471',
      desc: 'Point-of-Sale Hardware Systems',
      txval: 125000,
      rt: 18,
      iamt: 22500,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.98,
      confidences: { inum: 0.99, idt: 0.98, ctin: 0.98, hsn: 0.97, txval: 0.99 },
    },
    {
      id: 'inv_demo_019',
      inum: 'INV-019',
      idt: '25-09-2026',
      ctin: '07INVALIDGSTIN', // Invalid GSTIN!
      ctinName: 'Quick Traders Karol Bagh',
      pos: '07',
      section: 'B2B',
      hsn: '8471',
      desc: 'Compact Desktop PC',
      txval: 15000,
      rt: 18,
      iamt: 2700,
      camt: 0,
      samt: 0,
      status: 'red',
      flag: {
        code: 'GSTIN_INVALID',
        pillLabel: 'GSTIN?',
        message: 'Invalid GSTIN format "07INVALIDGSTIN". Must match GSTN pattern.',
      },
      docAiConfidence: 0.84,
      confidences: { inum: 0.95, idt: 0.94, ctin: 0.52, hsn: 0.91, txval: 0.94 },
    },
    {
      id: 'inv_demo_020',
      inum: 'INV-020',
      idt: '26-09-2026',
      ctin: '', // No GSTIN + inter-state ('08' Rajasthan) + > 2.5L => B2CL
      ctinName: 'Jaipur Heritage Palace (Unregistered Inter-state)',
      pos: '08',
      section: 'B2CL',
      hsn: '8471',
      desc: 'Complete Office Automation Package',
      txval: 260000,
      rt: 18,
      iamt: 46800,
      camt: 0,
      samt: 0,
      status: 'green',
      docAiConfidence: 0.98,
      confidences: { inum: 0.99, idt: 0.98, hsn: 0.97, txval: 0.99 },
    },
    {
      id: 'inv_demo_021',
      inum: 'INV-021',
      idt: '26-09-2026',
      ctin: '',
      ctinName: 'Walk-in Retail Buyer A',
      pos: '06',
      section: 'B2CS',
      hsn: '8471',
      desc: 'External USB Hard Drives',
      txval: 10000,
      rt: 18,
      iamt: 0,
      camt: 900,
      samt: 900,
      status: 'green',
      docAiConfidence: 0.93,
      confidences: { inum: 0.95, idt: 0.94, hsn: 0.93, txval: 0.95 },
    },
    {
      id: 'inv_demo_022',
      inum: 'INV-022',
      idt: '27-09-2026',
      ctin: '',
      ctinName: 'Walk-in Retail Buyer B',
      pos: '06',
      section: 'B2CS',
      hsn: '8471',
      desc: 'Wireless Keyboards & Mice',
      txval: 8000,
      rt: 18,
      iamt: 0,
      camt: 720,
      samt: 720,
      status: 'green',
      docAiConfidence: 0.94,
      confidences: { inum: 0.96, idt: 0.95, hsn: 0.94, txval: 0.96 },
    },
    {
      id: 'inv_demo_023',
      inum: 'INV-023',
      idt: '27-09-2026',
      ctin: '',
      ctinName: 'Walk-in Retail Buyer C',
      pos: '06',
      section: 'B2CS',
      hsn: '8517',
      desc: 'Wi-Fi Extenders & Cables',
      txval: 12000,
      rt: 18,
      iamt: 0,
      camt: 1080,
      samt: 1080,
      status: 'green',
      docAiConfidence: 0.95,
      confidences: { inum: 0.96, idt: 0.95, hsn: 0.94, txval: 0.96 },
    },
    {
      id: 'inv_demo_024',
      inum: 'INV-024',
      idt: '28-09-2026',
      ctin: '',
      ctinName: 'Walk-in Retail Buyer D',
      pos: '06',
      section: 'B2CS',
      hsn: '8471',
      desc: 'Computer Monitor 24-inch',
      txval: 7000,
      rt: 18,
      iamt: 0,
      camt: 630,
      samt: 630,
      status: 'green',
      docAiConfidence: 0.95,
      confidences: { inum: 0.97, idt: 0.95, hsn: 0.94, txval: 0.97 },
    },
  ];

  for (const inv of seedInvs) {
    const taxTotal = inv.iamt + inv.camt + inv.samt;
    const invDoc = {
      id: inv.id,
      bizId: DEMO_BIZ_ID,
      period: DEMO_PERIOD,
      kind: 'sales',
      inum: inv.inum,
      idt: inv.idt,
      ctin: inv.ctin,
      ctinName: inv.ctinName,
      pos: inv.pos,
      rchrg: 'N',
      invTyp: 'R',
      section: inv.section,
      items: [
        {
          num: 1,
          hsn: inv.hsn,
          desc: inv.desc,
          qty: 1,
          uqc: 'NOS',
          txval: inv.txval,
          rt: inv.rt,
          iamt: inv.iamt,
          camt: inv.camt,
          samt: inv.samt,
          csamt: 0,
        },
      ],
      totals: {
        txval: inv.txval,
        iamt: inv.iamt,
        camt: inv.camt,
        samt: inv.samt,
        csamt: 0,
        totalTax: taxTotal,
        grandTotal: inv.txval + taxTotal,
      },
      status: inv.status,
      flag: inv.flag || null,
      flags: inv.flag ? [inv.flag] : [],
      docAiConfidence: inv.docAiConfidence,
      confidences: inv.confidences,
      correctedByUser: false,
      confirmed: inv.status === 'green',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.invoices.set(inv.id, invDoc);
  }
}

seedDemoInvoices();

// Seed Demo Purchases, GSTR-2B, and Reconciliation Records
function seedDemoPurchasesAnd2B() {
  // 1. Unfiled purchase bills (In books, missing in 2B)
  const unfiled = [
    {
      id: 'pur_104',
      inum: 'INV-104',
      idt: '04-09-2026',
      supplierGstin: '06AABCS1429B1ZB',
      supplierName: 'Sharma Traders',
      txval: 58000,
      tax: 10440,
      cause: 'SUPPLIER_NOT_FILED',
      severity: 'red',
      causeLabel: "Supplier didn't file this bill",
      amountAtRisk: 10440,
      whatHappened: "Sharma Traders' INV-104 (₹58,000) is in your books but missing from your GSTR-2B.",
      moneyInvolved: "₹10,440 of tax credit at risk (Why?)",
      whyItMatters: "You can only claim credit for bills your supplier actually filed. Until they file, this ₹10,440 is blocked.",
      actions: [
        { id: '1', text: 'Call Sharma Traders — ask them to file GSTR-1', checked: true },
        { id: '2', text: 'If they refuse, keep the bill ready for DRC-01C response', checked: false },
      ],
    },
    {
      id: 'pur_118',
      inum: 'INV-118',
      idt: '12-09-2026',
      supplierGstin: '07BBCDS2530C2ZC',
      supplierName: 'Kalyan Hardware Supplies',
      txval: 100000,
      tax: 18000,
      cause: 'SUPPLIER_NOT_FILED',
      severity: 'red',
      causeLabel: "Supplier didn't file this bill",
      amountAtRisk: 18000,
      whatHappened: "Kalyan Hardware's INV-118 (₹1,00,000) is in your books but missing from your GSTR-2B.",
      moneyInvolved: "₹18,000 of tax credit at risk (Why?)",
      whyItMatters: "Supplier missed the monthly GSTR-1 cutoff date. Credit cannot be claimed in GSTR-3B this month.",
      actions: [
        { id: '1', text: 'Send formal reminder notice to supplier finance team', checked: false },
        { id: '2', text: 'Track for inclusion in next month GSTR-2B', checked: true },
      ],
    },
    {
      id: 'pur_132',
      inum: 'INV-132',
      idt: '19-09-2026',
      supplierGstin: '06CCDES3641D3ZD',
      supplierName: 'Metro Tech Distributors',
      txval: 800000,
      tax: 144000,
      cause: 'SUPPLIER_NOT_FILED',
      severity: 'red',
      causeLabel: "Supplier didn't file this bill",
      amountAtRisk: 144000,
      whatHappened: "Metro Tech's high-value capital bill INV-132 (₹8,00,000) was not reported in their outward GSTR-1.",
      moneyInvolved: "₹1,44,000 large tax credit blocked (Why?)",
      whyItMatters: "High value gap will immediately trigger automated DRC-01C notice under Rule 88D if claimed in 3B.",
      actions: [
        { id: '1', text: 'Hold pending supplier payment until GSTR-1 filing ARN is provided', checked: true },
        { id: '2', text: 'Verify supplier GST filing frequency (Quarterly QRMP vs Monthly)', checked: false },
      ],
    },
  ];

  // 2. Mismatch bills (Difference between books and 2B)
  const mismatches = [
    {
      id: 'pur_108',
      inum: 'INV-108',
      idt: '08-09-2026',
      supplierGstin: '07DDDES4752E4ZE',
      supplierName: 'Apex Industrial Parts',
      booksTxval: 180000,
      booksTax: 32400,
      gstr2bTxval: 150000,
      gstr2bTax: 27000,
      cause: 'VALUE_MISMATCH',
      severity: 'amber',
      causeLabel: 'Tax value mismatch between books and 2B',
      amountAtRisk: 5400,
      whatHappened: "For INV-108, your books record ₹32,400 tax, but GSTR-2B only shows ₹27,000.",
      moneyInvolved: "₹5,400 excess credit in books (Why?)",
      whyItMatters: "Supplier likely excluded post-sale freight/packing charges in their uploaded return.",
      actions: [
        { id: '1', text: 'Request debit note from supplier for ₹30,000 differential taxable value', checked: true },
        { id: '2', text: 'Claim only ₹27,000 in this month GSTR-3B to stay compliant', checked: false },
      ],
    },
    {
      id: 'pur_115',
      inum: 'INV-115',
      idt: '11-09-2026',
      supplierGstin: '06EEDES5863F5ZF',
      supplierName: 'Delta Logistics Services',
      booksTxval: 80000,
      booksTax: 14400,
      gstr2bTxval: 65000,
      gstr2bTax: 11700,
      cause: 'VALUE_MISMATCH',
      severity: 'amber',
      causeLabel: 'Tax value mismatch between books and 2B',
      amountAtRisk: 2700,
      whatHappened: "Your books reflect ₹14,400 tax for logistics bill INV-115, but 2B reflects ₹11,700.",
      moneyInvolved: "₹2,700 differential ITC (Why?)",
      whyItMatters: "Claiming ₹14,400 without matching 2B triggers red flag under Rule 88D.",
      actions: [
        { id: '1', text: 'Reconcile consignment weight slip against billed invoice', checked: false },
        { id: '2', text: 'Request amended B2BA entry in next GSTR-1', checked: false },
      ],
    },
    {
      id: 'pur_122',
      inum: 'INV-122',
      idt: '15-09-2026',
      supplierGstin: '07FFDES6974G6ZG',
      supplierName: 'United Steel Traders',
      booksTxval: 120000,
      booksTax: 21600,
      gstr2bTxval: 100000,
      gstr2bTax: 18000,
      cause: 'VALUE_MISMATCH',
      severity: 'amber',
      causeLabel: 'Tax value mismatch between books and 2B',
      amountAtRisk: 3600,
      whatHappened: "United Steel entered ₹1,00,000 on portal instead of full invoice value of ₹1,20,000.",
      moneyInvolved: "₹3,600 tax credit discrepancy (Why?)",
      whyItMatters: "Credit difference will block matching during automated annual audit.",
      actions: [
        { id: '1', text: 'Obtain copy of supplier GSTR-1 filing summary', checked: false },
        { id: '2', text: 'Reconcile invoice serial numbers', checked: true },
      ],
    },
    {
      id: 'pur_129',
      inum: 'INV-129',
      idt: '18-09-2026',
      supplierGstin: '06GGDES7085H7ZH',
      supplierName: 'Zenith Electronics LLP',
      booksTxval: 50000,
      booksTax: 9000,
      gstr2bTxval: 50000,
      gstr2bTax: 8940,
      cause: 'VALUE_MISMATCH',
      severity: 'amber',
      causeLabel: 'Rounding difference in tax',
      amountAtRisk: 60,
      whatHappened: "Rounding difference of ₹60 between internal software and supplier portal entry.",
      moneyInvolved: "₹60 minor variance (Why?)",
      whyItMatters: "Within statutory round-off limits, but recommended to align.",
      actions: [
        { id: '1', text: 'Accept supplier rounded figure of ₹8,940', checked: true },
      ],
    },
  ];

  // 3. Record in 2B, but missing in books (Unclaimed credit!)
  const missingInBooks = [
    {
      id: 'gstr2b_208',
      inum: 'INV-208',
      idt: '20-09-2026',
      supplierGstin: '07HHDES8196J8ZJ',
      supplierName: 'Global Cable Corporation',
      booksTxval: 0,
      booksTax: 0,
      gstr2bTxval: 47222,
      gstr2bTax: 8500,
      cause: 'MISSING_IN_BOOKS',
      severity: 'blue',
      causeLabel: 'In GSTR-2B but missing in your books',
      amountAtRisk: 0,
      whatHappened: "Global Cable Corporation uploaded bill INV-208 with ₹8,500 ITC, but it is not booked in your accounts.",
      moneyInvolved: "₹8,500 unclaimed tax credit available to you! (Why?)",
      whyItMatters: "You are entitled to claim this credit to reduce your monthly tax cash payout.",
      actions: [
        { id: '1', text: 'Confirm receipt of goods/services with warehouse manager', checked: false },
        { id: '2', text: 'Enter bill into purchase register to claim ₹8,500 ITC', checked: false },
      ],
    },
  ];

  // Populate purchase invoices
  unfiled.forEach((u) => {
    memoryStore.purchases.set(u.id, {
      id: u.id,
      bizId: DEMO_BIZ_ID,
      period: DEMO_PERIOD,
      kind: 'purchase',
      inum: u.inum,
      idt: u.idt,
      supplierGstin: u.supplierGstin,
      supplierName: u.supplierName,
      totals: { txval: u.txval, totalTax: u.tax },
      createdAt: new Date().toISOString(),
    });
  });

  mismatches.forEach((m) => {
    memoryStore.purchases.set(m.id, {
      id: m.id,
      bizId: DEMO_BIZ_ID,
      period: DEMO_PERIOD,
      kind: 'purchase',
      inum: m.inum,
      idt: m.idt,
      supplierGstin: m.supplierGstin,
      supplierName: m.supplierName,
      totals: { txval: m.booksTxval, totalTax: m.booksTax },
      createdAt: new Date().toISOString(),
    });

    memoryStore.gstr2b.set(`gstr2b_${m.inum}`, {
      id: `gstr2b_${m.inum}`,
      bizId: DEMO_BIZ_ID,
      period: DEMO_PERIOD,
      inum: m.inum,
      idt: m.idt,
      supplierGstin: m.supplierGstin,
      supplierName: m.supplierName,
      txval: m.gstr2bTxval,
      iamt: m.gstr2bTax,
      camt: 0,
      samt: 0,
      createdAt: new Date().toISOString(),
    });
  });

  missingInBooks.forEach((mb) => {
    memoryStore.gstr2b.set(mb.id, {
      id: mb.id,
      bizId: DEMO_BIZ_ID,
      period: DEMO_PERIOD,
      inum: mb.inum,
      idt: mb.idt,
      supplierGstin: mb.supplierGstin,
      supplierName: mb.supplierName,
      txval: mb.gstr2bTxval,
      iamt: mb.gstr2bTax,
      camt: 0,
      samt: 0,
      createdAt: new Date().toISOString(),
    });
  });

  // Populate 37 matched purchase bills
  for (let i = 1; i <= 37; i++) {
    const id = `pur_match_${i}`;
    const inum = `INV-M${String(i).padStart(3, '0')}`;
    const txval = 15000 + i * 2000;
    const tax = Math.round(txval * 0.18);
    const supplierGstin = `06AAAPL${String(1000 + i)}K1Z5`;
    const supplierName = `Supplier Partner ${i}`;

    memoryStore.purchases.set(id, {
      id,
      bizId: DEMO_BIZ_ID,
      period: DEMO_PERIOD,
      kind: 'purchase',
      inum,
      idt: '15-09-2026',
      supplierGstin,
      supplierName,
      totals: { txval, totalTax: tax },
      createdAt: new Date().toISOString(),
    });

    memoryStore.gstr2b.set(`2b_${id}`, {
      id: `2b_${id}`,
      bizId: DEMO_BIZ_ID,
      period: DEMO_PERIOD,
      inum,
      idt: '15-09-2026',
      supplierGstin,
      supplierName,
      txval,
      iamt: tax,
      camt: 0,
      samt: 0,
      createdAt: new Date().toISOString(),
    });
  }

  // Populate Reconciled Results in memory
  const allResults = [
    ...unfiled.map((u) => ({
      id: `reco_${u.id}`,
      inum: u.inum,
      idt: u.idt,
      supplierGstin: u.supplierGstin,
      supplierName: u.supplierName,
      cause: u.cause,
      severity: u.severity,
      causeLabel: u.causeLabel,
      booksTxval: u.txval,
      booksTax: u.tax,
      gstr2bTxval: 0,
      gstr2bTax: 0,
      amountAtRisk: u.amountAtRisk,
      whatHappened: u.whatHappened,
      moneyInvolved: u.moneyInvolved,
      whyItMatters: u.whyItMatters,
      actions: u.actions,
    })),
    ...mismatches.map((m) => ({
      id: `reco_${m.id}`,
      inum: m.inum,
      idt: m.idt,
      supplierGstin: m.supplierGstin,
      supplierName: m.supplierName,
      cause: m.cause,
      severity: m.severity,
      causeLabel: m.causeLabel,
      booksTxval: m.booksTxval,
      booksTax: m.booksTax,
      gstr2bTxval: m.gstr2bTxval,
      gstr2bTax: m.gstr2bTax,
      amountAtRisk: m.amountAtRisk,
      whatHappened: m.whatHappened,
      moneyInvolved: m.moneyInvolved,
      whyItMatters: m.whyItMatters,
      actions: m.actions,
    })),
    ...missingInBooks.map((mb) => ({
      id: `reco_${mb.id}`,
      inum: mb.inum,
      idt: mb.idt,
      supplierGstin: mb.supplierGstin,
      supplierName: mb.supplierName,
      cause: mb.cause,
      severity: mb.severity,
      causeLabel: mb.causeLabel,
      booksTxval: 0,
      booksTax: 0,
      gstr2bTxval: mb.gstr2bTxval,
      gstr2bTax: mb.gstr2bTax,
      amountAtRisk: 0,
      whatHappened: mb.whatHappened,
      moneyInvolved: mb.moneyInvolved,
      whyItMatters: mb.whyItMatters,
      actions: mb.actions,
    })),
  ];

  const recoSnapshot = {
    bizId: DEMO_BIZ_ID,
    period: DEMO_PERIOD,
    matchScore: CONFIG.demo.matchScore, // 94%
    matchedCount: CONFIG.demo.matchedCount, // 41
    totalBillsCount: CONFIG.demo.totalBillsCount, // 45
    moneyAtRisk: CONFIG.demo.moneyAtRisk, // 184200
    missingIn2BCount: CONFIG.demo.missingIn2BCount, // 3
    missingInBooksCount: CONFIG.demo.missingInBooksCount, // 1
    mismatchesCount: CONFIG.demo.mismatchesCount, // 4
    items: allResults,
    reconciledAt: new Date().toISOString(),
  };

  memoryStore.reco.set(`${DEMO_BIZ_ID}_${DEMO_PERIOD}`, recoSnapshot);
}

seedDemoPurchasesAnd2B();

export { adminApp, memoryStore, DEMO_BIZ_ID, DEMO_PERIOD };

export function getFirestoreDb(): Firestore | null {
  try {
    if (!adminApp) return null;
    return getFirestore(adminApp);
  } catch (e) {
    return null;
  }
}

export async function getAuthenticatedUid(req: NextRequest): Promise<string | null> {
  if (!adminApp) return null;
  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(authorization.slice(7));
    return decoded.uid;
  } catch {
    return null;
  }
}
