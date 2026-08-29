import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numerical amounts in Indian Currency (INR) or standard currency.
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "₹0";
  }
  const num = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a standard date string nicely
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Format a date with time for audit records
 */
export function formatDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Generate unique human-readable application reference: NC-APP-YYYY-XXXX
 */
export function generateApplicationId(sequenceNum?: number): string {
  const year = new Date().getFullYear();
  const randomSuffix = sequenceNum
    ? String(sequenceNum).padStart(4, "0")
    : Math.floor(1000 + Math.random() * 9000).toString();
  return `NC-APP-${year}-${randomSuffix}`;
}

/**
 * Generate unique loan agreement reference: NC-AGR-YYYY-XXXX
 */
export function generateAgreementId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `NC-AGR-${year}-${randomSuffix}`;
}

/**
 * Generate unique loan account number: NC-LN-YYYY-XXXX
 */
export function generateLoanId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `NC-LN-${year}-${randomSuffix}`;
}

/**
 * Calculate Loan Financials using Flat Percentage on Full Principal
 * Total Interest = Principal * (Rate / 100)
 * Total Payable = Principal + Total Interest
 * Installment (EMI) = Total Payable / TenureMonths
 * Example: 1000 @ 13.5% = 1135 Total (Interest: 135)
 */
export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): { emi: number; totalInterest: number; totalPayable: number } {
  if (!principal || !annualRatePercent || !tenureMonths) {
    return { emi: 0, totalInterest: 0, totalPayable: 0 };
  }

  const rate = Number(annualRatePercent);
  const totalInterest = Math.round(Number(principal) * (rate / 100));
  const totalPayable = Number(principal) + totalInterest;
  const emi = Math.round(totalPayable / Number(tenureMonths));

  return {
    emi,
    totalInterest,
    totalPayable,
  };
}
