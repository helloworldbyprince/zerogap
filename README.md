# ZeroGap (Zero gap. Zero notice.)
### AI GST Reconciliation & Filing Copilot for Indian MSMEs and Chartered Accountants

[![AI Builder Cup 2026](https://img.shields.io/badge/AI%20Builder%20Cup-2026%20BFSI%20Track-F5A524?style=for-the-badge&logo=googlecloud&logoColor=black)](https://github.com/helloworldbyprince/zerogap)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-asia--south1%20(Mumbai)-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com)
[![Document AI](https://img.shields.io/badge/Google%20Cloud-Document%20AI%20Invoice%20Parser-17C964?style=for-the-badge&logo=google&logoColor=white)](https://cloud.google.com/document-ai)
[![Gemini 2.0](https://img.shields.io/badge/Vertex%20AI-Gemini%202.0%20Flash%20(SSE)-3B82F6?style=for-the-badge&logo=google&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 🎯 Executive Summary

In India's ₹1.7 lakh crore/month GST ecosystem, **Input Tax Credit (ITC)** is the lifeblood of small businesses. Under **GST Rule 88D**, the GST system automatically cross-checks ITC claimed in GSTR-3B against available credits in GSTR-2B. When a supplier forgets to file, files late, or enters an incorrect GSTIN, the buyer receives an automated **DRC-01C demand notice** giving them only **7 days** to pay back the tax credit with 18% annual interest or face an automated freeze on their outward billing (GSTR-1).

Today, **6.3 crore Indian MSMEs** and their practicing Chartered Accountants spend 15–20 stressful hours every month manually comparing paper bills, blurred phone photos, and portal Excel files to find these discrepancies before the tax department does.

**ZeroGap** solves this end-to-end. By pairing **Google Cloud Document AI** with **Gemini 2.0 Flash** and a single-region deterministic reconciliation engine in Mumbai (`asia-south1`), ZeroGap ingests raw bills, automates statutory classification, matches purchase books against official 2B records, audits the GSTR-1/2B/3B tax triangle, and exports portal-ready GSTR-1 files — all in seconds.

---

## ⚡ The Four Pillars of ZeroGap

```
 ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
 │     FEATURE 1        │   │     FEATURE 2        │   │     FEATURE 3        │   │     FEATURE 4        │
 │  Bills in,           │   │  Find every rupee    │   │  Three numbers.      │   │  Month, quarter,     │
 │  GSTR-1 out.         │   │  of credit at risk.  │   │  Zero surprises.     │   │  year — one view.    │
 └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
            │                          │                          │                          │
            ▼                          ▼                          ▼                          ▼
   Document AI parses         Deterministic match        Triangle audit of          Historical rollups
   PDF/JPG bills, checks      engine reconciles books    GSTR-1 liability,          powered by partitioned
   HSNs & GSTINs, and builds  against GSTR-2B; flags     2B available credit, and   BigQuery tables feeding
   portal-ready GSTR-1 JSON.  Rule 88D/DRC-01C causes.   3B tax paid with "Why?".   annual GSTR-9 filings.
```

### 1. Feature 1: Sales Bills $\rightarrow$ GSTR-1 (Outward Supplies)
- **Document AI Pretrained Invoice Parser:** Ingests raw sales invoices (PDF, JPG, PNG) and extracts 15+ statutory fields with per-field confidence scoring.
- **Statutory Auto-Classification (§2.5):**
  - Buyer GSTIN provided $\rightarrow$ **Table 4 (B2B)**
  - No GSTIN + Inter-State + Value $> ₹2,50,000$ $\rightarrow$ **Table 5 (B2C Large / B2CL)**
  - All remaining consumer invoices $\rightarrow$ **Table 7 (B2C Small / B2CS)**
- **Verification Engine (§2.6):**
  - GSTIN pattern verification (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`)
  - HSN digit requirements (min 4 digits for turnover $\le ₹5\text{cr}$, min 6 digits for $> ₹5\text{cr}$)
  - HSN Master Rate verification against CBIC schedules snapshot ("Rates as of September 2026")
  - Tax arithmetic verification ($\pm 0.01$ tolerance)
- **Portal-Ready File Export:** Generates byte-exact offline tool JSON (`GSTR1_{GSTIN}_{MMYYYY}.json`) and multi-sheet Excel workbooks.

### 2. Feature 2: Purchases vs GSTR-2B Reconciliation
- Reconciles internal purchase registers against official GSTR-2B JSON/Excel downloads.
- Flags mismatches with CA-approved root cause taxonomy:
  - `SUPPLIER_NOT_FILED`: Supplier omitted invoice from their GSTR-1
  - `SUPPLIER_FILED_LATE`: Supplier filed after the 11th/13th cutoff
  - `WRONG_GSTIN`: Invoice uploaded under incorrect recipient GSTIN
  - `VALUE_MISMATCH`: Taxable value or tax rate discrepancy
  - `INELIGIBLE_17_5`: Blocked credit under Section 17(5)
- Computes exact **₹ Tax Credit at Risk** and displays plain-English actionable steps.

### 3. Feature 3: The Triangle Check (1 vs 2B vs 3B)
- Evaluates the three core numbers that GST auditors examine:
  1. **Outward Tax Liability:** What you reported in GSTR-1
  2. **Available ITC:** What your suppliers uploaded in GSTR-2B
  3. **Tax Paid / Claimed:** What you paid and claimed in GSTR-3B
- Calculates Rule 88C liability gaps and Rule 88D credit gaps before notices are triggered.
- Permanent disclaimer: *"A gap is a question, not a verdict. Review the possible causes before deciding."*

### 4. Feature 4: Multi-Period Analytics & GSTR-9 Preparation
- Historical trends powered by partitioned **BigQuery** tables.
- Aggregates multi-month liabilities, ITC utilization rates, and supplier compliance scores to directly support the annual GSTR-9 audit return.

---

## 🎨 UI/UX Philosophy — Targeted for the $2,000 "Best UI/UX" Award

Designed to break away from boring, sterile tax software while avoiding unnecessary visual clutter:

- **Fintech Precision Visual Language:** Dark graphite aesthetic (`#0A0C10`, `#11141A`, `#161B22`) accented with amber (`#F5A524`) for action items, emerald (`#17C964`) for verified statuses, and crimson (`#F31260`) for blocking errors.
- **The "Money-at-Risk" Hero:** Instant high-contrast visual anchor displaying exact rupee liability at risk with count-up animations.
- **"Why? ⓘ" Affordance:** The transparency feature CAs love — click or hover on any rupee figure to reveal the exact 1–2 line mathematical breakdown.
- **Dual-Language Accessibility (English + Hinglish `हिं`):** 1-click toggle in the top bar translates navigation, action titles, and warning pills for grassroots Indian business owners.
- **Traffic Light Indicators:** Never plain text statuses:
  - `🟢` Verified / Green
  - `🟡` Advisory Review (`RATE?`, `LOW_CONFIDENCE`)
  - `🔴` Blocking Error (`GSTIN?`, `HSN?`, `MATH?`)
- **Document AI Inspector Drawer:** Click any bill in the review table to inspect the visual document scan alongside field confidence bars and edit values live with instant re-validation.
- **5 Clicks to Value:** Zero signup wall. Judges can click *"Try the live demo"* on the landing page and reach complete reconciliation in $\le 5$ clicks.

---

## 🏛 Architecture & Latency Playbook

```mermaid
flowchart TD
    User["User / Chartered Accountant"] -->|Drop Bills PDF/JPG| NextApp["Next.js 15 Web Application (asia-south1)"]
    NextApp -->|POST /api/uploads (<300ms 202 Accepted)| Storage["Cloud Storage (zerogap-uploads-509816)"]
    
    subgraph GCP["Google Cloud Platform · asia-south1 (Mumbai)"]
        Storage -->|Raw Stream| DocAI["Document AI (Invoice Processor)"]
        DocAI -->|Extracted JSON| Worker["Background Worker (/api/jobs/run)"]
        Worker -->|Dual-Write| Firestore[("Firestore Native Database")]
        Worker -->|Partitioned Append| BigQuery[("BigQuery Dataset: gst")]
        Worker -->|Audit Engine| MatchingEngine["Deterministic Matching Engine"]
        MatchingEngine -->|Precomputed Snapshot| Firestore
        
        Gemini["Vertex AI Gemini 2.0 Flash"] -->|SSE Token Stream (<1.5s)| NextApp
    end

    Firestore -->|1-Read Fast Snapshot (<800ms)| Dashboard["Dashboard & Review Table"]
```

### The "Zero-Latency" Rules
1. **Single-Region Rule:** Everything runs strictly in Google Cloud's **`asia-south1` (Mumbai)** region. No cross-region hops.
2. **Dashboard = 1 Firestore Read:** Period metrics are precomputed during ingestion and reconciliation; the dashboard never executes real-time aggregations.
3. **Async Non-Blocking Uploads:** File ingestion returns HTTP 202 Accepted in $<300\text{ms}$; Document AI parsing runs in background workers with live progress updates.
4. **Streaming AI Explanations:** Gemini 2.0 Flash streams explanations over Server-Sent Events (SSE), achieving time-to-first-token in $<1.5\text{s}$.
5. **Optimistic UI:** Cell corrections re-validate and update state immediately on the client while syncing with the server in the background.

---

## 📦 Tech Stack & Inventory

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 + TypeScript | High performance SSR & server actions |
| **Styling** | Tailwind CSS v4 + Radix UI Primitives | Accessible tokens with CSS-first configuration |
| **Document Understanding** | Google Cloud Document AI (`asia-south1`) | Pretrained Indian invoice entity parser |
| **Generative Explanations** | Google Vertex AI Gemini 2.0 Flash | Ultra-low latency streamed natural language reasoning |
| **Primary Database** | Cloud Firestore Native Mode | Low-latency sub-800ms reads for period snapshots |
| **Analytics Engine** | Cloud BigQuery (`gst` dataset) | Partitioned multi-period historical aggregation |
| **Object Storage** | Google Cloud Storage | Secure bill and generated export storage |
| **Authentication** | Firebase Auth (Google Sign-In) | Frictionless 1-click authentication with demo fallback |
| **Validation & Schema** | Zod + Config Law | Strict type safety and centralised business limits |
| **Exports** | ExcelJS + Byte-exact JSON | Statutory GSTR-1 offline portal format compliance |

---

## ⚙️ The Standing Config Law (§10)

Per project architecture rules, **no magic numbers or hardcoded thresholds** appear anywhere in the application logic. Every rate, threshold, tolerance, and limit resides centrally in [`src/lib/config.ts`](file:///Users/prince/princekumarcode/production/zerogap/src/lib/config.ts):

```typescript
export const CONFIG = {
  region: 'asia-south1',
  app: { name: 'ZeroGap', tagline: 'Zero gap. Zero notice.' },
  gstr1: { dueDay: 11, b2clThreshold: 250000 },
  gstr2b: { generatedDay: 14 },
  gstr3b: { dueDay: 20 },
  drc01c: { replyDays: 7 },
  validation: {
    taxTolerance: 0.01,
    hsnDigitsUnder5Cr: 4,
    hsnDigitsOver5Cr: 6,
    gstinRegex: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
  },
  docAI: { confidenceWarnBelow: 0.85 },
  uploads: { maxFiles: 25, maxFileMB: 10, allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'] },
  ui: { pageSize: 50, maxWidthPx: 1200, toastDurationMs: 4000 },
  demo: {
    businessName: 'Sharma Traders (Demo)',
    periodLabel: 'September 2026',
    periodCode: '202609',
    moneyAtRisk: 184200,
    salesBillsReady: 24,
    salesTaxableValue: 842000,
    salesTax: 151560,
    // ...
  },
} as const;
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** 20 LTS or higher
- **npm:** 10+
- **Google Cloud Project:** Configured in `asia-south1` with Document AI and Vertex AI enabled.

### 1. Clone & Install
```bash
git clone git@github.com:helloworldbyprince/zerogap.git
cd zerogap
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
# Google Cloud
GCP_PROJECT_ID=zerogap-509816
GCP_REGION=asia-south1
DOCAI_PROCESSOR_ID=45ff58249590c913
DOCAI_LOCATION=asia-south1
STORAGE_BUCKET_UPLOADS=zerogap-uploads-509816
STORAGE_BUCKET_EXPORTS=zerogap-exports-509816

# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBgOocciXlyWeMomwmPkup_RSzdwMndtT4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zerogap-509816.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zerogap-509816
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zerogap-509816.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=677303028609
NEXT_PUBLIC_FIREBASE_APP_ID=1:677303028609:web:dffc44dcc422e63379b680
```

### 3. Run Locally
```bash
# Start Next.js development server
npm run dev

# Or build and launch production server on port 3002
npm run build
npx next start -p 3002
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

---

## 🧪 Evaluator Walkthrough (Judge Demo Flow)

Experience the complete application in under 60 seconds:

1. **Screen 0 (Landing):** Visit [`/`](http://localhost:3002) $\rightarrow$ Click **"Try the live demo"**.
2. **Screen 1 (Onboarding):** Pre-seeded with *Sharma Traders (Demo)* $\rightarrow$ Click **"Load demo data — 1 click"**.
3. **Screen 2 (Dashboard):** View the **₹1,84,200 Money Hero**, test the **"Why? ⓘ"** modal, toggle between English and Hinglish (`हिं`), and inspect the 3 feature cards.
4. **Screen 3 (F1 Sales Review):** Navigate to [`/app/sales`](http://localhost:3002/app/sales):
   - **Step A:** Test the drag-and-drop zone or click *"Load Sample Bills"* to watch Document AI progress bars parse files in real-time.
   - **Step B:** Review the 24 bills table. Notice the `RATE?` warning pill on `INV-007` (billed 12%, HSN 8471 usually 18%) and `GSTIN?` error on `INV-019`.
   - **Inspection Drawer:** Click on `INV-007` to open the right inspection drawer showing the bill preview and confidence score. Correct the rate to 18% $\rightarrow$ Click *"Save & Re-validate"* $\rightarrow$ Watch the row immediately turn green!
   - **Bulk Confirmation:** Click *"Confirm all green rows"* to bulk-verify ready bills.

---

## 📁 Repository Structure

```
zerogap/
├── SPEC.md                    # Official specification contract & phase gates
├── README.md                  # Comprehensive project documentation
├── package.json               # Dependencies & scripts
├── next.config.mjs            # Next.js 15 & serverExternalPackages configuration
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Screen 0: Public landing page
│   │   ├── onboarding/        # Screen 1: 3-step GST onboarding flow
│   │   ├── app/               # Authenticated application shell
│   │   │   ├── page.tsx       # Screen 2: Dashboard with ₹1,84,200 Money Hero
│   │   │   ├── sales/         # Screen 3: F1 Sales bills → GSTR-1
│   │   │   ├── purchases/     # Screen 4: F2 Purchases vs 2B reconciliation
│   │   │   ├── triangle/      # Screen 5: F3 GSTR-1 vs 2B vs 3B audit
│   │   │   ├── periods/       # Screen 6: F4 BigQuery period trends
│   │   │   ├── reports/       # Audit report generation
│   │   │   └── settings/      # Business & GSTIN configuration
│   │   └── api/               # Next.js Route Handlers (Zod validated)
│   │       ├── businesses/    # Business profiles CRUD
│   │       ├── dashboard/     # Precomputed period snapshot (1 read)
│   │       ├── gstr1/         # GSTR-1 JSON & Excel export API (Phase 4)
│   │       ├── invoices/      # Invoices list, PATCH correction, confirm-all
│   │       ├── reconcile/     # F2 Matching & reconciliation API (Phase 5)
│   │       ├── uploads/       # 202 Accepted upload pipeline
│   │       └── jobs/          # Async worker status polling
│   ├── components/
│   │   ├── cards/             # MoneyHero, DashboardMockCard
│   │   ├── layout/            # AppShell, TopBar, Stepper, ThemeToggle, Logo
│   │   ├── tables/            # InvoiceReviewTable & Document AI Drawer
│   │   ├── ui/                # Accessible Radix UI primitives
│   │   └── upload/            # Dropzone & Document AI JobProgress
│   ├── jobs/
│   │   └── uploadWorker.ts    # Background Document AI extraction worker
│   └── lib/
│       ├── config.ts          # Standing Config Law (§10)
│       ├── copy.ts            # English & Hinglish copy deck
│       ├── docai.ts           # Google Cloud Document AI client & parser
│       ├── gstr1.ts           # Byte-exact GSTR-1 JSON & Excel builder
│       ├── gstr2b.ts          # GSTR-2B Excel & CSV portal parser
│       ├── match.ts           # Deterministic matching engine & §2.8 taxonomy
│       ├── hsn.ts             # HSN Master reference as of September 2026
│       ├── classify.ts        # Auto-classification (B2B, B2CL, B2CS)
│       ├── validate.ts        # Statutory GST validation engine
│       ├── firebase.ts        # Firebase Client Auth (Google Sign-In)
│       └── firebase-admin.ts  # Firebase Admin SDK & in-memory seed store
```

---

## 🏆 Competition Details

- **Event:** Google Cloud AI Builder Cup 2026
- **Track:** BFSI (Banking, Financial Services, and Insurance)
- **Special Nomination:** $2,000 Best UI/UX Award
- **Team:** Team JalebiJS
- **Target:** Singapore Finale Demo

---

## 📄 License
ISC License · Made with pride for Indian Small Businesses and Chartered Accountants.
