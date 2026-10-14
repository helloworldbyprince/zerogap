export interface HsnMasterEntry {
  code: string;
  description: string;
  gstRate: number; // statutory GST percentage, e.g. 18 for 18%
  allowedRates?: number[]; // statutory rate tiers for multi-tier headings (e.g. [5, 12] or [18, 28])
  verifyManually?: boolean;
  notes?: string;
  updatedAsOf: string;
}

/**
 * HSN & SAC Master Reference as per official CBIC Rate Schedules (§2.7)
 * Source: Central Board of Indirect Taxes and Customs (CBIC), Government of India
 * Updated as of September 2026
 */
export const HSN_MASTER: Record<string, HsnMasterEntry> = {
  // --- Chapter 84: Machinery, Mechanical Appliances & Computers ---
  '8471': {
    code: '8471',
    description: 'Automatic data processing machines, computers, laptops, servers & microprocessors',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8473': {
    code: '8473',
    description: 'Parts and accessories of automatic data processing machines of heading 8471',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8443': {
    code: '8443',
    description: 'Printing machinery, copy machines, multi-function printers and facsimile',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8415': {
    code: '8415',
    description: 'Air conditioning machines, comprising motor-driven fan and elements for changing temp/humidity',
    gstRate: 28,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8418': {
    code: '8418',
    description: 'Refrigerators, freezers and other refrigerating or freezing equipment',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8450': {
    code: '8450',
    description: 'Household or laundry-type washing machines, including machines which both wash and dry',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8421': {
    code: '8421',
    description: 'Centrifuges, filtering or purifying machinery for liquids or gases, water purifiers',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8414': {
    code: '8414',
    description: 'Air or vacuum pumps, air compressors, ventilating fans and hoods',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 85: Electrical Machinery, Electronics & Telecom Equipment ---
  '8517': {
    code: '8517',
    description: 'Telephone sets, smartphones, routers, switches, modems & transmission apparatus',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8528': {
    code: '8528',
    description: 'Monitors, projectors and television reception apparatus',
    gstRate: 18,
    allowedRates: [18, 28],
    verifyManually: true,
    notes: '18% for computer monitors up to 32 inches; 28% for TV sets and displays exceeding 32 inches.',
    updatedAsOf: 'September 2026',
  },
  '8504': {
    code: '8504',
    description: 'Electrical transformers, static converters (UPS, inverters, power adaptors, battery chargers)',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8523': {
    code: '8523',
    description: 'Discs, solid-state non-volatile storage devices (SSDs, USB drives, memory cards, smart cards)',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8544': {
    code: '8544',
    description: 'Insulated wire, optical fibre cables, coaxial cables and electric conductors',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '8507': {
    code: '8507',
    description: 'Electric accumulators, storage batteries and cells',
    gstRate: 18,
    allowedRates: [18, 28],
    verifyManually: true,
    notes: '18% for lithium-ion/other accumulators; 28% for lead-acid batteries.',
    updatedAsOf: 'September 2026',
  },
  '8536': {
    code: '8536',
    description: 'Electrical apparatus for switching, circuit protection, fuses, plugs and sockets',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 99: Services Accounting Code (SAC) ---
  '9983': {
    code: '9983',
    description: 'Other professional, technical and business services, IT consulting, software development',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9982': {
    code: '9982',
    description: 'Legal, accounting, auditing, bookkeeping and taxation services',
    gstRate: 18,
    verifyManually: true,
    notes: '18% for accounting/auditing under forward charge. Legal services provided to business entities fall under RCM.',
    updatedAsOf: 'September 2026',
  },
  '9965': {
    code: '9965',
    description: 'Goods transport services (GTA)',
    gstRate: 5,
    allowedRates: [5, 12],
    verifyManually: true,
    notes: '5% without ITC or 12% with ITC under forward charge. Verify contract terms.',
    updatedAsOf: 'September 2026',
  },
  '9968': {
    code: '9968',
    description: 'Postal and courier services, express parcel and local delivery',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9954': {
    code: '9954',
    description: 'General construction and civil engineering services',
    gstRate: 18,
    allowedRates: [1, 5, 12, 18],
    verifyManually: true,
    notes: '18% standard rate. Concessional rates (1% or 5%) apply to affordable residential housing.',
    updatedAsOf: 'September 2026',
  },
  '9972': {
    code: '9972',
    description: 'Real estate services, commercial property leasing and renting',
    gstRate: 18,
    verifyManually: false,
    notes: '18% on commercial property leasing. Renting of residential dwelling for residence is exempt.',
    updatedAsOf: 'September 2026',
  },
  '9963': {
    code: '9963',
    description: 'Accommodation, food and beverage services (Hotels, restaurants)',
    gstRate: 5,
    allowedRates: [5, 12, 18],
    verifyManually: true,
    notes: '5% without ITC for restaurants and standalone eateries; 12%/18% for hotels based on room tariff.',
    updatedAsOf: 'September 2026',
  },
  '9964': {
    code: '9964',
    description: 'Passenger transport services (Road, air, rail)',
    gstRate: 5,
    allowedRates: [5, 12, 18],
    verifyManually: true,
    notes: '5% for economy air, metered cabs, e-commerce aggregators; 12% or 18% for non-economy or chartered travel.',
    updatedAsOf: 'September 2026',
  },
  '9967': {
    code: '9967',
    description: 'Supporting services in transport, cargo handling, storage and warehousing',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9984': {
    code: '9984',
    description: 'Telecommunications, internet access, broadcasting and information supply services',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9987': {
    code: '9987',
    description: 'Maintenance, repair and installation services of machinery and equipment',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '9988': {
    code: '9988',
    description: 'Manufacturing services on physical inputs owned by others (Job work)',
    gstRate: 12,
    allowedRates: [12, 18],
    verifyManually: true,
    notes: '12% for job work on textiles, leather, food processing; 18% for general engineering job work.',
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 73: Articles of Iron or Steel ---
  '7326': {
    code: '7326',
    description: 'Other articles of iron or steel',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '7308': {
    code: '7308',
    description: 'Structures and parts of structures of iron or steel (bridges, roofing, towers, pillars)',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 39: Plastics & Articles thereof ---
  '3923': {
    code: '3923',
    description: 'Articles for conveyance or packing of goods, boxes, bags, closures of plastics',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '3926': {
    code: '3926',
    description: 'Other articles of plastics and articles of other materials of headings 3901 to 3914',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 48: Paper, Paperboard & Stationery ---
  '4820': {
    code: '4820',
    description: 'Registers, account books, notebooks, order books, receipt books & stationery',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },
  '4819': {
    code: '4819',
    description: 'Cartons, boxes, cases, bags and other packing containers of paper or paperboard',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 30: Pharmaceutical Products ---
  '3004': {
    code: '3004',
    description: 'Medicaments consisting of mixed or unmixed products for therapeutic/prophylactic uses',
    gstRate: 12,
    allowedRates: [5, 12],
    verifyManually: false,
    notes: '12% standard; select life-saving formulations attract 5% or nil.',
    updatedAsOf: 'September 2026',
  },
  '3002': {
    code: '3002',
    description: 'Human blood, animal blood, vaccines, toxins, cultures of micro-organisms',
    gstRate: 5,
    allowedRates: [0, 5, 12],
    verifyManually: true,
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 61 & 62: Apparel & Garments ---
  '6109': {
    code: '6109',
    description: 'T-shirts, singlets and other vests, knitted or crocheted',
    gstRate: 5,
    allowedRates: [5, 12],
    verifyManually: true,
    notes: '5% if sale value <= ₹1,000 per piece; 12% if value > ₹1,000 per piece.',
    updatedAsOf: 'September 2026',
  },
  '6203': {
    code: '6203',
    description: "Men's or boys' suits, ensembles, jackets, blazers, trousers and shorts",
    gstRate: 5,
    allowedRates: [5, 12],
    verifyManually: true,
    notes: '5% if value <= ₹1,000 per piece; 12% if value > ₹1,000 per piece.',
    updatedAsOf: 'September 2026',
  },
  '6204': {
    code: '6204',
    description: "Women's or girls' suits, ensembles, jackets, dresses, skirts and trousers",
    gstRate: 5,
    allowedRates: [5, 12],
    verifyManually: true,
    notes: '5% if value <= ₹1,000 per piece; 12% if value > ₹1,000 per piece.',
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 87: Motor Vehicles & Auto Parts ---
  '8708': {
    code: '8708',
    description: 'Parts and accessories of motor vehicles of headings 8701 to 8705',
    gstRate: 28,
    allowedRates: [18, 28],
    verifyManually: false,
    notes: '28% standard rate. Parts specifically intended for tractors attract 18%.',
    updatedAsOf: 'September 2026',
  },
  '8703': {
    code: '8703',
    description: 'Motor cars and other motor vehicles principally designed for transport of persons',
    gstRate: 28,
    verifyManually: true,
    notes: '28% GST + applicable Compensation Cess (1% to 22%).',
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 94: Furniture & Lighting ---
  '9403': {
    code: '9403',
    description: 'Other furniture and parts thereof (office, kitchen, bedroom)',
    gstRate: 18,
    allowedRates: [5, 18],
    verifyManually: false,
    notes: '18% standard rate. Furniture made wholly of bamboo, cane or rattan attracts 5%.',
    updatedAsOf: 'September 2026',
  },
  '9405': {
    code: '9405',
    description: 'Lamps and lighting fittings, LED lamps, light fixtures and luminaires',
    gstRate: 18,
    verifyManually: false,
    updatedAsOf: 'September 2026',
  },

  // --- Chapter 10 & 22: Food & Beverages ---
  '1006': {
    code: '1006',
    description: 'Rice, pre-packaged and labelled',
    gstRate: 5,
    allowedRates: [0, 5],
    verifyManually: false,
    notes: '5% if pre-packaged and labelled; 0% if sold loose/unbranded.',
    updatedAsOf: 'September 2026',
  },
  '2202': {
    code: '2202',
    description: 'Waters including mineral waters and aerated waters, containing added sugar or flavour',
    gstRate: 28,
    verifyManually: true,
    notes: '28% GST + compensation cess applicable.',
    updatedAsOf: 'September 2026',
  },
};

/**
 * 2-Digit Chapter Level Fallback Rates
 * Used when a specific 4-digit heading is not in the primary master list
 */
export const HSN_CHAPTER_DEFAULTS: Record<string, HsnMasterEntry> = {
  '84': { code: '84', description: 'Machinery, mechanical appliances and computer equipment', gstRate: 18, updatedAsOf: 'September 2026' },
  '85': { code: '85', description: 'Electrical machinery, electronic equipment and telecoms', gstRate: 18, updatedAsOf: 'September 2026' },
  '99': { code: '99', description: 'Services (Services Accounting Code - SAC)', gstRate: 18, updatedAsOf: 'September 2026' },
  '73': { code: '73', description: 'Articles of iron or steel', gstRate: 18, updatedAsOf: 'September 2026' },
  '39': { code: '39', description: 'Plastics and articles thereof', gstRate: 18, updatedAsOf: 'September 2026' },
  '48': { code: '48', description: 'Paper and paperboard, articles of paper pulp', gstRate: 18, updatedAsOf: 'September 2026' },
  '30': { code: '30', description: 'Pharmaceutical products', gstRate: 12, updatedAsOf: 'September 2026' },
  '87': { code: '87', description: 'Vehicles and parts/accessories thereof', gstRate: 28, updatedAsOf: 'September 2026' },
  '94': { code: '94', description: 'Furniture, bedding, luminaires and prefabricated buildings', gstRate: 18, updatedAsOf: 'September 2026' },
  '61': { code: '61', description: 'Articles of apparel and clothing accessories, knitted or crocheted', gstRate: 5, updatedAsOf: 'September 2026' },
  '62': { code: '62', description: 'Articles of apparel and clothing accessories, not knitted or crocheted', gstRate: 5, updatedAsOf: 'September 2026' },
  '10': { code: '10', description: 'Cereals and food grains', gstRate: 5, updatedAsOf: 'September 2026' },
  '22': { code: '2202', description: 'Beverages, spirits and vinegar', gstRate: 28, updatedAsOf: 'September 2026' },
};

/**
 * Look up an HSN code with hierarchical fallback:
 * 1. Exact match (4, 6, or 8 digits)
 * 2. 6-digit prefix lookup
 * 3. 4-digit prefix lookup
 * 4. 2-digit chapter default
 */
export function lookupHsn(hsnCode: string): HsnMasterEntry | null {
  if (!hsnCode) return null;
  const clean = hsnCode.trim().replace(/\D/g, '');
  if (!clean) return null;

  // 1. Exact match
  if (HSN_MASTER[clean]) {
    return HSN_MASTER[clean];
  }

  // 2. 6-digit prefix match (e.g. 996812 matches 9968 if registered as 6-digit, or prefix)
  if (clean.length >= 6) {
    const prefix6 = clean.substring(0, 6);
    if (HSN_MASTER[prefix6]) {
      return HSN_MASTER[prefix6];
    }
  }

  // 3. 4-digit prefix match (e.g. 84713010 matches 8471, 996812 matches 9968)
  if (clean.length >= 4) {
    const prefix4 = clean.substring(0, 4);
    if (HSN_MASTER[prefix4]) {
      return HSN_MASTER[prefix4];
    }
  }

  // 4. 2-digit chapter level fallback
  if (clean.length >= 2) {
    const prefix2 = clean.substring(0, 2);
    if (HSN_CHAPTER_DEFAULTS[prefix2]) {
      return HSN_CHAPTER_DEFAULTS[prefix2];
    }
  }

  return null;
}
