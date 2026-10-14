ZeroGap Comprehensive GST Test Pack - Prince Traders (September 2026)
================================================================================

REGISTERED ENTITY DETAILS:
  Business Name:  Prince Traders
  GSTIN:          06ABCDE1234F1Z1
  PAN:            ABCDE1234F
  Registered In:  Haryana (State Code: 06)
  Address:        Plot 108, Sector 18, Electronic City, Gurugram, Haryana 122015
  Turnover Slab:  OVER_5CR (Mandates 6-digit statutory HSNs)
  Period:         202609 (September 2026)

TEST WORKFLOW IN ZEROGAP:
1. Register / Switch Business:
   - Ensure the business is selected as 'Prince Traders' with GSTIN: 06ABCDE1234F1Z1.
   - Period: September 2026 (202609).

2. Upload Sales Invoices (Sales -> Upload more bills):
   - sales_INV-TEST-001.pdf     : Clean B2B inter-state sale to Northstar Analytics (Delhi). Status: GREEN.
   - sales_INV-TEST-002.pdf     : Clean B2CS intra-state sale to Walk-in Customer (Haryana). Status: GREEN.
   - sales_INV-RATE-WARN-003.pdf: Advisory rate mismatch (HSN 847130 at 12% instead of 18%). Status: AMBER.
   - sales_INV-HSN-ERROR-004.pdf: Blocking invalid HSN length ('996' is only 3 digits; >5CR requires 6 digits). Status: RED.
                                  -> Click 'Edit & Re-validate' and update to '996812' to make it GREEN!
   - sales_INV-B2CL-005.pdf     : High-value inter-state unregistered sale (>2.5L to Dr. Vikram Malhotra, Karnataka).
                                  -> Automatically classified into GSTR-1 Table 5 (B2CL). Status: GREEN.

3. Upload GSTR-2B Statement (Purchases vs 2B -> Upload GSTR-2B):
   - Upload 'prince_traders_gstr2b_202609.xlsx' (or 'prince_traders_gstr2b_202609.csv').
   - Contains 7 portal records including exact matches, portal value mismatch, typo GSTIN, and 2 unclaimed ITC records.

4. Upload Purchase Invoices (Purchases vs 2B -> Purchase bills):
   - purchase_PUR-MATCH-101.pdf         : Orbit Office Solutions (Exact match, 100% safe ITC). Status: GREEN.
   - purchase_PUR-MATCH-102.pdf         : Delhi Computer House (Exact match, 100% safe ITC). Status: GREEN.
   - purchase_PUR-MISSING-103.pdf       : Slowfile Components (Missing in 2B, supplier not filed). Status: RED.
   - purchase_PUR-VALUE-MISMATCH-104.pdf : Metro Print Systems (Books: 60k/10.8k tax vs 2B: 55k/9.9k tax). Status: AMBER.
   - purchase_PUR-WRONG-GSTIN-105.pdf   : Apex Furniture (Supplier typo on portal: 06HIJKL9999P8Z9). Status: RED.
   - purchase_PUR-DUPLICATE-106.pdf     : Steel Rack Industries. Upload ONCE for GREEN match; upload TWICE to test duplicate detection!

5. Reconcile Purchases vs 2B:
   - Click 'Run Reconciliation' to test automated matching, risk calculation (INR 15,300 at risk), and unclaimed ITC (INR 10,800).

6. GSTR-3B & Triangle 3-Way Audit:
   - See 'gstr3b_figures.txt' and 'gstr3b_summary_figures.json' for exact statutory numbers.
