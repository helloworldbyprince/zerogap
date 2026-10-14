# ZeroGap Comprehensive GST Test Pack - Prince Traders

Complete, verified statutory GST test dataset for testing **ZeroGap** across Sales Bill parsing, GSTR-1 classification, GSTR-2B reconciliation, Rule 88C/88D statutory notices, and GSTR-3B tax computations.

---

## 1. Entity Profile (Prince Traders)

| Parameter | Value |
| :--- | :--- |
| **Business / Trade Name** | **Prince Traders** |
| **Registered GSTIN** | **`06ABCDE1234F1Z1`** |
| **PAN** | `ABCDE1234F` |
| **Registered Address** | Plot 108, Sector 18, Electronic City, Gurugram, Haryana 122015 |
| **State / State Code** | Haryana (`06`) |
| **Turnover Slab** | `OVER_5CR` (Mandates 6-digit statutory HSN codes) |
| **Tax Return Period** | `202609` (September 2026) |

---

## 2. Dataset Files Summary

### A. Sales Invoices (Issued BY Prince Traders `06ABCDE1234F1Z1`)
| File | Invoice No. | Date | Customer Name | Customer GSTIN | POS | HSN | Taxable (₹) | Rate | Tax (₹) | Expected Status | Statutory Table / Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sales_INV-TEST-001.pdf` | `INV-TEST-001` | 05-09-2026 | Northstar Analytics Pvt Ltd | `07ABCDE2345G1Z6` | `07 - Delhi` | `847130` | 1,20,000.00 | 18% | 21,600.00 | **GREEN** | GSTR-1 Table 4A (Clean B2B inter-state) |
| `sales_INV-TEST-002.pdf` | `INV-TEST-002` | 08-09-2026 | Walk-in Customer | `Unregistered` | `06 - Haryana` | `851762` | 50,000.00 | 18% | 9,000.00 | **GREEN** | GSTR-1 Table 7 (Clean B2CS retail intra-state) |
| `sales_INV-RATE-WARN-003.pdf` | `INV-RATE-WARN-003` | 12-09-2026 | Bluepeak Systems Pvt Ltd | `07BCDEF3456H2Z7` | `07 - Delhi` | `847130` | 40,000.00 | 12% | 4,800.00 | **AMBER** | Rate advisory warning (Standard rate is 18%) |
| `sales_INV-HSN-ERROR-004.pdf` | `INV-HSN-ERROR-004` | 15-09-2026 | Horizon Logistics LLP | `06CDEFG4567J3Z8` | `06 - Haryana` | `996` | 18,000.00 | 18% | 3,240.00 | **RED** | Blocking error (3 digits; >5CR mandates 6 digits) |
| `sales_INV-B2CL-005.pdf` | `INV-B2CL-005` | 22-09-2026 | Dr. Vikram Malhotra | `Unregistered` | `29 - Karnataka` | `847150` | 3,20,000.00 | 18% | 57,600.00 | **GREEN** | GSTR-1 Table 5 (B2CL invoice > ₹2,50,000 threshold) |

**Sales Totals (Table 3.1 Outward Liability):**
- Taxable Value: **₹5,48,000.00**
- IGST: **₹84,000.00** | CGST: **₹6,120.00** | SGST: **₹6,120.00**
- Total Outward Tax: **₹96,240.00** (Invoice Total: ₹6,44,240.00)

---

### B. Purchase Invoices (Billed TO Prince Traders `06ABCDE1234F1Z1`)
| File | Invoice No. | Date | Supplier Name | Supplier GSTIN | POS | HSN | Taxable (₹) | Rate | Total Tax (₹) | 2B Reconciliation Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `purchase_PUR-MATCH-101.pdf` | `PUR-MATCH-101` | 06-09-2026 | Orbit Office Solutions | `06DEFGH5678K4Z9` | `06` | `482010` | 25,000.00 | 18% | 4,500.00 | **MATCHED (GREEN)** - 100% eligible ITC |
| `purchase_PUR-MATCH-102.pdf` | `PUR-MATCH-102` | 09-09-2026 | Delhi Computer House | `07EFGHI6789L5Z1` | `07` | `847130` | 1,50,000.00 | 18% | 27,000.00 | **MATCHED (GREEN)** - 100% eligible ITC |
| `purchase_PUR-MISSING-103.pdf` | `PUR-MISSING-103` | 11-09-2026 | Slowfile Components Pvt Ltd | `07FGHIJ7890M6Z2` | `07` | `851762` | 80,000.00 | 18% | 14,400.00 | **SUPPLIER_NOT_FILED (RED)** - Blocked under Sec 16(2)(aa) |
| `purchase_PUR-VALUE-MISMATCH-104.pdf` | `PUR-VALUE-MISMATCH-104` | 14-09-2026 | Metro Print Systems | `06GHIJK8901N7Z3` | `06` | `844332` | 60,000.00 | 18% | 10,800.00 | **VALUE_MISMATCH (AMBER)** - 2B has ₹55k (₹900 gap) |
| `purchase_PUR-WRONG-GSTIN-105.pdf` | `PUR-WRONG-GSTIN-105` | 18-09-2026 | Apex Furniture Works | `06HIJKL9012P8Z4` | `06` | `940310` | 1,00,000.00 | 18% | 18,000.00 | **WRONG_GSTIN (RED)** - Supplier portal typo |
| `purchase_PUR-DUPLICATE-106.pdf` | `PUR-DUPLICATE-106` | 21-09-2026 | Steel Rack Industries | `06IJKLM0123Q9Z5` | `06` | `732690` | 75,000.00 | 18% | 13,500.00 | **DUPLICATE_BOOKING** - Flagged on 2nd upload |

**Purchase Books Totals:**
- Taxable Value: **₹4,90,000.00**
- IGST: **₹41,400.00** | CGST: **₹23,400.00** | SGST: **₹23,400.00**
- Total Books ITC: **₹88,200.00**

---

### C. GSTR-2B Statement (`prince_traders_gstr2b_202609.xlsx` & `.csv`)
Contains 7 portal records:
1. `PUR-MATCH-101` (Orbit Office Solutions): Taxable ₹25,000.00 | CGST ₹2,250.00 | SGST ₹2,250.00
2. `PUR-MATCH-102` (Delhi Computer House): Taxable ₹1,50,000.00 | IGST ₹27,000.00
3. `PUR-VALUE-MISMATCH-104` (Metro Print Systems): Taxable ₹55,000.00 | CGST ₹4,950.00 | SGST ₹4,950.00
4. `PUR-WRONG-GSTIN-105` (Apex Furniture - Typo GSTIN `06HIJKL9999P8Z9`): Taxable ₹1,00,000.00 | CGST ₹9,000.00 | SGST ₹9,000.00
5. `PUR-DUPLICATE-106` (Steel Rack Industries): Taxable ₹75,000.00 | CGST ₹6,750.00 | SGST ₹6,750.00
6. `CF-2026-8812` (**Cloudflare India Pvt Ltd** - `07AAACC1234D1Z8`): Taxable ₹45,000.00 | IGST ₹8,100.00 (**Missing in Books / Unclaimed ITC!**)
7. `AB-90412` (**Airtel Broadband Ltd** - `06BBBCD5678E1Z4`): Taxable ₹15,000.00 | CGST ₹1,350.00 | SGST ₹1,350.00 (**Missing in Books / Unclaimed ITC!**)

**GSTR-2B Available Credit Totals:**
- Taxable Value: **₹4,65,000.00**
- IGST: **₹35,100.00** | CGST: **₹24,300.00** | SGST: **₹24,300.00**
- Total 2B Credit Available: **₹83,700.00**

---

## 3. Statutory GSTR-3B Summary & Triangle Check Figures

### Table 3.1: Outward Supplies Liability
- Outward Taxable Value: **₹5,48,000.00**
- IGST: **₹84,000.00**
- CGST: **₹6,120.00**
- SGST: **₹6,120.00**
- **Total Tax Liability:** **₹96,240.00**

### Table 4: Eligible ITC & Risk Analysis
- **GSTR-2B Total Credit Available:** ₹83,700.00
- **Books ITC Claimed:** ₹88,200.00
- **Total Money at Risk under Rule 88D (DRC-01C):** **₹15,300.00**
  - Unfiled Bill (`PUR-MISSING-103`): ₹14,400.00
  - Value Discrepancy (`PUR-VALUE-MISMATCH-104`): ₹900.00
- **Unclaimed ITC (Missing in Books):** **₹10,800.00** (Cloudflare ₹8,100 + Airtel ₹2,700)
- **Net Statutorily Safe Matched ITC:** **₹54,900.00**

### Table 6.1: Net Tax Payable in Cash (PMT-06)
- Total Outward Tax: ₹96,240.00
- Less Eligible ITC Utilized: ₹39,240.00 (IGST ₹27,000 + CGST ₹6,120 + SGST ₹6,120)
- **Net Cash Tax Payable (Challan):** **₹57,000.00** (All in IGST head)
- **Balance ITC Carried Forward:** **₹15,660.00** (CGST ₹7,830 + SGST ₹7,830)

### Triangle 3-Way Audit:
1. **Sales Check (GSTR-1 Outward vs 3B Paid):**
   - Outward Liability: ₹96,240.00 | 3B Paid: ₹96,240.00 | Gap: **₹0.00** (`GREEN`, Match)
2. **Credit Check (GSTR-2B Available vs 3B Claimed):**
   - 2B Available: ₹83,700.00 | Claimed: ₹88,200.00 | Excess: **₹4,500.00** (`AMBER`, DRC-01C risk)
   - ZeroGap recommendation restricts claim to verified safe ITC (₹54,900.00), preventing notices completely.
