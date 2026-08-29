export interface LoanProduct {
  id: string;
  name: string;
  category: "personal";
  tagline: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  baseInterestRateMonthly: number;
  baseInterestRateAnnual: number;
  processingFeePercent: number;
  repaymentFrequencies: ("WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "BULLET")[];
  features: string[];
  eligibility: string[];
  requiredDocuments: string[];
}

export const getAnnualInterestRate = (tenureMonths: number): number => {
  return tenureMonths <= 3 ? 13.5 : 14.7;
};

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: "personal-loan",
    name: "Personal Loan",
    category: "personal",
    tagline: "Tailored personal financial assistance for your personal goals and emergency needs",
    description:
      "A confidential, flexible personal credit facility with tenure up to 3 months at 13.5% p.a., and above 3 months up to 5 months at 14.7% p.a. Maximum tenure is strictly 5 months.",
    minAmount: 10000,
    maxAmount: 2500000,
    minTenureMonths: 1,
    maxTenureMonths: 5,
    baseInterestRateMonthly: 1.125,
    baseInterestRateAnnual: 13.5,
    processingFeePercent: 1.5,
    repaymentFrequencies: ["MONTHLY", "BI_WEEKLY", "WEEKLY", "BULLET"],
    features: [
      "Tenure up to 3 months @ 13.5% p.a. fixed rate",
      "Tenure 4 to 5 months @ 14.7% p.a. fixed rate (Max 5 Months)",
      "Strict maximum tenure of 5 months",
      "Simple document review & clear eligibility",
      "Direct disbursement via Bank Transfer, instant UPI, or Cash",
      "Structured fixed installment (EMI) or lump-sum bullet settlement",
      "No hidden charges or unexpected fees",
    ],
    eligibility: [
      "Resident individual aged 18 years and above",
      "Salaried executive, self-employed professional, business owner, or student",
      "Valid Government photo identification & PAN Card",
    ],
    requiredDocuments: [
      "Applicant Live Photo / Selfie (Compulsory)",
      "Permanent Account Number (PAN Card) Copy (Compulsory)",
      "Government photo identity proof (Aadhaar / Passport / Voter ID) (Compulsory)",
      "Disbursement details (Bank Account, UPI ID, or Cash handover)",
      "Address proof (if current address differs from ID proof)",
    ],
  },
];

export const CALCULATION_METHODS = [
  {
    id: "REDUCING_BALANCE",
    label: "Reducing Balance (Standard EMI)",
    description: "Interest calculated monthly on the remaining principal balance.",
  },
  {
    id: "FLAT_RATE",
    label: "Flat Rate",
    description: "Fixed interest applied uniformly over the total principal.",
  },
  {
    id: "SIMPLE_INTEREST",
    label: "Simple Interest",
    description: "Standard linear rate calculation per annual tenure.",
  },
];

export const REPAYMENT_FREQUENCIES = [
  { value: "MONTHLY", label: "Monthly Installments" },
  { value: "BI_WEEKLY", label: "Bi-Weekly (Fortnightly)" },
  { value: "WEEKLY", label: "Weekly Installments" },
  { value: "BULLET", label: "Lump Sum Settlement at Maturity (Settle All Amount at Last)" },
];

export const KYC_DOC_TYPES = [
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "PAN_CARD", label: "PAN Card" },
  { value: "PASSPORT", label: "Valid Passport" },
  { value: "VOTER_ID", label: "Voter ID Card" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
];
