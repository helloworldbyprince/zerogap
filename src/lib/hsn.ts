export interface HsnMasterEntry {
  code: string;
  description: string;
  gstRate: number; // e.g. 18 for 18%
  verifyManually?: boolean;
  notes?: string;
  updatedAsOf: string;
}

/**
 * HSN Master Reference as of September 2026 (§2.7)
 * Source: CBIC Rate Schedules snapshot
 */
export const HSN_MASTER: Record<string, HsnMasterEntry> = {
  '8471': {
    code: '8471',
    description: 'Automatic data processing machines & computers',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8517': {
    code: '8517',
    description: 'Telephone sets, smartphones & transmission apparatus',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8443': {
    code: '8443',
    description: 'Printing machinery, copy machines and facsimile',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9983': {
    code: '9983',
    description: 'Other professional, technical and business services',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9982': {
    code: '9982',
    description: 'Legal and accounting services',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9965': {
    code: '9965',
    description: 'Goods transport services (GTA)',
    gstRate: 5,
    verifyManually: true,
    notes: '5% without ITC or 12% with ITC. Verify contract terms.',
    updatedAsOf: 'September 2026',
  },
  '4820': {
    code: '4820',
    description: 'Registers, account books, notebooks & stationery',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '3004': {
    code: '3004',
    description: 'Medicaments consisting of mixed or unmixed products',
    gstRate: 12,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '6109': {
    code: '6109',
    description: 'T-shirts, singlets and other vests, knitted or crocheted',
    gstRate: 12,
    verifyManually: true,
    notes: '5% if value <= ₹1,000 per piece; 12% if value > ₹1,000.',
    updatedAsOf: 'September 2026',
  },
  '8708': {
    code: '8708',
    description: 'Parts and accessories of motor vehicles',
    gstRate: 28,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '2202': {
    code: '2202',
    description: 'Waters including mineral waters and aerated waters',
    gstRate: 28,
    verifyManually: true,
    notes: '28% GST + compensation cess applicable.',
    updatedAsOf: 'September 2026',
  },
  '1006': {
    code: '1006',
    description: 'Rice, pre-packaged and labelled',
    gstRate: 5,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9403': {
    code: '9403',
    description: 'Other furniture and parts thereof',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '7326': {
    code: '7326',
    description: 'Other articles of iron or steel',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '3923': {
    code: '3923',
    description: 'Articles for conveyance or packing of goods, of plastics',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
};

/**
 * Look up an HSN code. Matches 4, 6, or 8 digits by prefix lookup.
 */
export function lookupHsn(hsnCode: string): HsnMasterEntry | null {
  if (!hsnCode) return null;
  const clean = hsnCode.trim();

  // Exact match
  if (HSN_MASTER[clean]) {
    return HSN_MASTER[clean];
  }

  // Prefix match (e.g. 84713010 matches 8471)
  const prefix4 = clean.substring(0, 4);
  if (HSN_MASTER[prefix4]) {
    return HSN_MASTER[prefix4];
  }

  return null;
}
