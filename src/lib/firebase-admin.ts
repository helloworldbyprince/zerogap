import { getApps, getApp, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { CONFIG } from '@/lib/config';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK safely
function initAdmin(): App {
  const apps = getApps();
  if (apps.length > 0 && apps[0]) {
    return apps[0];
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

  // Fallback to application default credentials / project ID
  return initializeApp({
    projectId: projectId,
  });
}

const adminApp = initAdmin();

// In-memory cache/mock store for offline dev & instant demo reads
const memoryStore = {
  businesses: new Map<string, any>(),
  periods: new Map<string, any>(),
  jobs: new Map<string, any>(),
};

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

export { adminApp, memoryStore, DEMO_BIZ_ID, DEMO_PERIOD };

export function getFirestoreDb(): Firestore | null {
  try {
    return getFirestore(adminApp);
  } catch (e) {
    return null;
  }
}
