/**
 * Pangisa Fee Calculations
 *
 * Tenant fee: max(2000, round(rent * 0.25% / 500) * 500)
 * Landlord fee: max(10000, ceil(rent * 3%))
 */

export function calcTenantFee(monthlyRent: number): number {
  return Math.max(2000, Math.round((monthlyRent * 0.0025) / 500) * 500);
}

export function calcLandlordFee(monthlyRent: number, units: number = 1): number {
  const baseFeePerUnit = Math.max(10000, Math.ceil(monthlyRent * 0.03));
  const total = baseFeePerUnit * units;
  const discount = getLandlordDiscount(units);
  return Math.round(total * (1 - discount));
}

export function getLandlordDiscount(units: number): number {
  if (units >= 20) return 0.35;
  if (units >= 10) return 0.30;
  if (units >= 5) return 0.20;
  if (units >= 3) return 0.15;
  if (units >= 2) return 0.10;
  return 0;
}

export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString("en-UG")}`;
}

export const PENDING_EXPIRY_HOURS = 48;
