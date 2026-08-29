import { z } from "zod";

export const borrowerDetailsSchema = z.object({
  fullName: z.string().min(2, "Full legal name must be at least 2 characters"),
  dob: z.string().refine((val) => {
    if (!val) return false;
    const birthDate = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  }, "Applicant must be at least 18 years of age"),
  fatherOrSpouseName: z.string().min(2, "Relative name is required"),
  mobile: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return (
      (digits.length === 10 && /^[6-9]/.test(digits)) ||
      (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2)))
    );
  }, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Please enter a valid email address"),
  currentAddress: z.string().min(10, "Full current residential address is required"),
  permanentAddress: z.string().min(10, "Permanent address is required"),
  occupation: z.string().min(2, "Occupation description is required"),
  employerOrBusinessName: z.string().optional(),
});

export const loanDetailsSchema = z.object({
  productId: z.string().min(1, "Please select a loan product"),
  productName: z.string().min(1, "Product name is required"),
  amount: z.number().min(1000, "Minimum principal amount is ₹1,000"),
  tenureMonths: z.number().min(1, "Minimum tenure is 1 month").max(5, "Maximum loan tenure is 5 months"),
  purpose: z.string().min(5, "Please describe the specific purpose of the credit facility"),
  repaymentFrequency: z.enum(["WEEKLY", "BI_WEEKLY", "MONTHLY", "BULLET"]),
  proposedDisbursementDate: z.string().min(1, "Proposed disbursement date is required"),
  proposedInterestRateAnnual: z.number().positive(),
  proposedProcessingFeePercent: z.number().nonnegative(),
  calculationMethod: z.enum(["REDUCING_BALANCE", "FLAT_RATE", "SIMPLE_INTEREST"]),
  estimatedEMI: z.number().nonnegative().optional(),
  estimatedTotalPayable: z.number().nonnegative().optional(),
});

export const kycDetailsSchema = z.object({
  documentType: z.enum(["AADHAAR", "PAN_CARD", "PASSPORT", "VOTER_ID", "DRIVING_LICENSE"]),
  documentNumber: z.string().min(4, "Identification number is required"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid 10-character PAN (e.g. ABCDE1234F)"),
  ckycNumber: z.string().optional(),
});

export const incomeDetailsSchema = z
  .object({
    occupationType: z.enum(["SALARIED", "SELF_EMPLOYED", "BUSINESS_OWNER", "CONSULTANT", "STUDENT", "OTHER"]),
    monthlyIncome: z.number().nonnegative("Monthly income cannot be negative"),
    existingLoanObligationsMonthly: z.number().nonnegative().optional(),
    primaryBankName: z.string().optional(),
    primaryAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    disbursementMode: z.enum(["BANK_TRANSFER", "UPI", "CASH"]).default("BANK_TRANSFER"),
    upiId: z.string().optional(),
    cashPreferredCity: z.string().optional(),
    cashContactPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.disbursementMode === "BANK_TRANSFER") {
      if (!data.primaryBankName || data.primaryBankName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryBankName"],
          message: "Bank name is required for bank transfer",
        });
      }
      if (!data.primaryAccountNumber || data.primaryAccountNumber.trim().length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryAccountNumber"],
          message: "Valid account number is required (min 6 digits)",
        });
      }
      if (!data.ifscCode || data.ifscCode.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ifscCode"],
          message: "Valid IFSC code is required",
        });
      }
    } else if (data.disbursementMode === "UPI") {
      if (!data.upiId || !data.upiId.includes("@")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["upiId"],
          message: "Please enter a valid UPI ID (e.g. yourname@upi or 9876543210@upi)",
        });
      }
      if (!data.cashContactPhone || data.cashContactPhone.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cashContactPhone"],
          message: "Linked mobile number is required for UPI transfer",
        });
      }
    } else if (data.disbursementMode === "CASH") {
      if (!data.cashPreferredCity || data.cashPreferredCity.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cashPreferredCity"],
          message: "Please specify preferred city or branch for cash handover",
        });
      }
      if (!data.cashContactPhone || data.cashContactPhone.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cashContactPhone"],
          message: "Direct contact phone is required for cash handover verification",
        });
      }
    }
  });

export const guarantorDetailsSchema = z.object({
  hasGuarantor: z.boolean(),
  fullName: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  relationship: z.string().optional(),
  occupation: z.string().optional(),
});

export const uploadedDocumentSchema = z.object({
  id: z.string(),
  docType: z.enum([
    "PHOTO",
    "LIVE_PHOTO",
    "PAN_CARD",
    "IDENTITY_PROOF",
    "ADDRESS_PROOF",
    "INCOME_PROOF",
    "OTHER",
  ]),
  fileName: z.string(),
  fileSize: z.number(),
  fileMimeType: z.string(),
  fileUrl: z.string(),
  uploadedAt: z.string(),
});

export const consentRecordSchema = z.object({
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must acknowledge and accept the declaration" }),
  }),
  consentVersion: z.string(),
  consentTimestamp: z.string(),
  signatureType: z.enum(["DRAWN", "TYPED"]),
  signatureData: z.string().min(2, "Valid signature is required"),
  signerFullName: z.string().min(2, "Signer legal name is required"),
  signerIpAddress: z.string().optional(),
  signerUserAgent: z.string().optional(),
});

export const fullApplicationSubmissionSchema = z.object({
  borrower: borrowerDetailsSchema,
  loan: loanDetailsSchema,
  kyc: kycDetailsSchema,
  income: incomeDetailsSchema,
  guarantor: guarantorDetailsSchema,
  documents: z
    .array(uploadedDocumentSchema)
    .min(2, "Please provide Live Photo, PAN Card copy, and Government ID proof")
    .superRefine((docs, ctx) => {
      const hasPhoto = docs.some((d) => d.docType === "PHOTO" || d.docType === "LIVE_PHOTO");
      const hasPan = docs.some((d) => d.docType === "PAN_CARD");
      const hasId = docs.some((d) => d.docType === "IDENTITY_PROOF");

      if (!hasPhoto) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Applicant Live Photo / Selfie is compulsory",
        });
      }
      if (!hasPan) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "PAN Card document upload is compulsory",
        });
      }
      if (!hasId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Government Identity Proof is compulsory",
        });
      }
    }),
  consent: consentRecordSchema,
});
