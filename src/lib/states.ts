export interface IndianState {
  code: string;
  name: string;      // Formatted with code prefix for dropdowns (e.g. "06 - Haryana")
  stateName: string; // Plain English state name (e.g. "Haryana")
}

/**
 * Authoritative list of all 38 Indian GST State and Union Territory Codes
 * as codified by the GST Council / CBIC + 97 Other Territory.
 */
export const INDIAN_STATES: IndianState[] = [
  { code: '01', name: '01 - Jammu and Kashmir', stateName: 'Jammu and Kashmir' },
  { code: '02', name: '02 - Himachal Pradesh', stateName: 'Himachal Pradesh' },
  { code: '03', name: '03 - Punjab', stateName: 'Punjab' },
  { code: '04', name: '04 - Chandigarh', stateName: 'Chandigarh' },
  { code: '05', name: '05 - Uttarakhand', stateName: 'Uttarakhand' },
  { code: '06', name: '06 - Haryana', stateName: 'Haryana' },
  { code: '07', name: '07 - Delhi', stateName: 'Delhi' },
  { code: '08', name: '08 - Rajasthan', stateName: 'Rajasthan' },
  { code: '09', name: '09 - Uttar Pradesh', stateName: 'Uttar Pradesh' },
  { code: '10', name: '10 - Bihar', stateName: 'Bihar' },
  { code: '11', name: '11 - Sikkim', stateName: 'Sikkim' },
  { code: '12', name: '12 - Arunachal Pradesh', stateName: 'Arunachal Pradesh' },
  { code: '13', name: '13 - Nagaland', stateName: 'Nagaland' },
  { code: '14', name: '14 - Manipur', stateName: 'Manipur' },
  { code: '15', name: '15 - Mizoram', stateName: 'Mizoram' },
  { code: '16', name: '16 - Tripura', stateName: 'Tripura' },
  { code: '17', name: '17 - Meghalaya', stateName: 'Meghalaya' },
  { code: '18', name: '18 - Assam', stateName: 'Assam' },
  { code: '19', name: '19 - West Bengal', stateName: 'West Bengal' },
  { code: '20', name: '20 - Jharkhand', stateName: 'Jharkhand' },
  { code: '21', name: '21 - Odisha', stateName: 'Odisha' },
  { code: '22', name: '22 - Chhattisgarh', stateName: 'Chhattisgarh' },
  { code: '23', name: '23 - Madhya Pradesh', stateName: 'Madhya Pradesh' },
  { code: '24', name: '24 - Gujarat', stateName: 'Gujarat' },
  { code: '25', name: '25 - Daman and Diu', stateName: 'Daman and Diu' },
  { code: '26', name: '26 - Dadra and Nagar Haveli and Daman and Diu', stateName: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: '27', name: '27 - Maharashtra', stateName: 'Maharashtra' },
  { code: '28', name: '28 - Andhra Pradesh (Old)', stateName: 'Andhra Pradesh (Old)' },
  { code: '29', name: '29 - Karnataka', stateName: 'Karnataka' },
  { code: '30', name: '30 - Goa', stateName: 'Goa' },
  { code: '31', name: '31 - Lakshadweep', stateName: 'Lakshadweep' },
  { code: '32', name: '32 - Kerala', stateName: 'Kerala' },
  { code: '33', name: '33 - Tamil Nadu', stateName: 'Tamil Nadu' },
  { code: '34', name: '34 - Puducherry', stateName: 'Puducherry' },
  { code: '35', name: '35 - Andaman and Nicobar Islands', stateName: 'Andaman and Nicobar Islands' },
  { code: '36', name: '36 - Telangana', stateName: 'Telangana' },
  { code: '37', name: '37 - Andhra Pradesh', stateName: 'Andhra Pradesh' },
  { code: '38', name: '38 - Ladakh', stateName: 'Ladakh' },
  { code: '97', name: '97 - Other Territory', stateName: 'Other Territory' },
];

/**
 * Fast lookup map from 2-digit GST state code to plain state name.
 */
export const GST_STATE_MAP: Record<string, string> = INDIAN_STATES.reduce(
  (acc, s) => {
    acc[s.code] = s.stateName;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Returns the plain English name for a given 2-digit GST state code.
 */
export function getStateNameByCode(code: string | undefined | null): string {
  if (!code) return 'Other State';
  return GST_STATE_MAP[code] || 'Other State';
}

/**
 * Checks whether a given 2-digit string represents a recognized GST state code.
 */
export function isValidStateCode(code: string | undefined | null): boolean {
  if (!code) return false;
  return Boolean(GST_STATE_MAP[code]);
}

