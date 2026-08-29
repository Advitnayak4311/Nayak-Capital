export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "AGREEMENT_PENDING"
  | "AGREEMENT_SIGNED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type AgreementStatus =
  | "DRAFT"
  | "GENERATED"
  | "PENDING_SIGNATURE"
  | "SIGNED"
  | "CANCELLED"
  | "SUPERSEDED";

export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "DEFAULTED"
  | "CANCELLED"
  | "CLOSED";

export type RepaymentFrequency = "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "BULLET";

export type CalculationMethod = "REDUCING_BALANCE" | "FLAT_RATE" | "SIMPLE_INTEREST";

export interface BorrowerDetails {
  fullName: string;
  dob: string;
  fatherOrSpouseName: string;
  mobile: string;
  email: string;
  currentAddress: string;
  permanentAddress?: string;
  occupation: string;
  employerOrBusinessName?: string;
}

export interface LoanRequestedDetails {
  productId: string;
  productName: string;
  amount: number;
  tenureMonths: number;
  purpose: string;
  repaymentFrequency: RepaymentFrequency;
  proposedDisbursementDate: string;
  proposedInterestRateAnnual: number;
  proposedProcessingFeePercent: number;
  calculationMethod: CalculationMethod;
  estimatedEMI?: number;
  estimatedTotalPayable?: number;
}

export interface KycDetails {
  documentType: "AADHAAR" | "PAN_CARD" | "PASSPORT" | "VOTER_ID" | "DRIVING_LICENSE";
  documentNumber: string;
  panNumber?: string;
}

export type DisbursementMode = "BANK_TRANSFER" | "UPI" | "CASH";

export interface IncomeDetails {
  occupationType: "SALARIED" | "SELF_EMPLOYED" | "BUSINESS_OWNER" | "PROFESSIONAL" | "CONSULTANT" | "STUDENT" | "OTHER";
  monthlyIncome: number;
  existingLoanObligationsMonthly?: number;
  disbursementMode?: DisbursementMode;
  primaryBankName?: string;
  primaryAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  cashPreferredCity?: string;
  cashContactPhone?: string;
}

export interface GuarantorDetails {
  hasGuarantor: boolean;
  fullName?: string;
  mobile?: string;
  email?: string;
  address?: string;
  relationship?: string;
  occupation?: string;
}

export interface UploadedDocument {
  id: string;
  docType: "PHOTO" | "LIVE_PHOTO" | "PAN_CARD" | "IDENTITY_PROOF" | "ADDRESS_PROOF" | "INCOME_PROOF" | "OTHER";
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  fileUrl: string; // Protected stream path or base64
  uploadedAt: string;
}

export interface ConsentRecord {
  consentGiven: boolean;
  consentVersion: string;
  consentTimestamp: string;
  signatureType: "DRAWN" | "TYPED";
  signatureData: string; // Base64 data URL or typed full legal name
  signerFullName: string;
  signerIpAddress?: string;
  signerUserAgent?: string;
}

export interface AdminNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isCustomerVisible?: boolean;
}

export interface CustomerMessage {
  id: string;
  type: "INFO_REQUEST" | "STATUS_UPDATE" | "BORROWER_REPLY";
  sender: "ADMIN" | "BORROWER";
  title: string;
  message: string;
  createdAt: string;
  requestedDocs?: string[];
  resolved?: boolean;
}

export interface LoanApplication {
  id: string; // MongoDB _id or string ID
  applicationId: string; // Human-readable NC-APP-2026-XXXX
  borrower: BorrowerDetails;
  loan: LoanRequestedDetails;
  kyc: KycDetails;
  income: IncomeDetails;
  guarantor: GuarantorDetails;
  documents: UploadedDocument[];
  consent?: ConsentRecord;
  agreementId?: string;
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedBy: string;
    changedAt: string;
    note?: string;
  }[];
  adminNotes: AdminNote[];
  messages: CustomerMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalLoanAgreement {
  id: string;
  agreementId: string; // NC-AGR-2026-XXXX
  applicationId: string;
  borrowerName: string;
  borrowerAddress: string;
  borrowerMobile: string;
  borrowerEmail: string;
  principalAmount: number;
  interestRateAnnual: number;
  calculationMethod: CalculationMethod;
  tenureMonths: number;
  repaymentFrequency: RepaymentFrequency;
  installmentAmount: number;
  totalInterest: number;
  totalPayable: number;
  disbursementDate: string;
  agreementVersion: string;
  templateVersion: string;
  status: AgreementStatus;
  borrowerSignature?: {
    signatureData: string;
    signatureType: "DRAWN" | "TYPED";
    signedAt: string;
    signedIp?: string;
  };
  lenderSignature?: {
    signatoryName: string;
    signatoryTitle: string;
    signatureData: string;
    signedAt: string;
  };
  witnessDetails?: {
    name: string;
    mobile: string;
    address: string;
  };
  generatedAt: string;
  updatedAt: string;
}

export interface RepaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  expectedAmount: number;
  principalComponent: number;
  interestComponent: number;
  paidAmount: number;
  paidDate?: string;
  paymentMethod?: "UPI" | "BANK_TRANSFER" | "CHEQUE" | "CASH" | "AUTO_DEBIT";
  transactionReference?: string;
  status: "PENDING" | "PAID" | "PARTIALLY_PAID" | "OVERDUE";
  notes?: string;
}

export interface LoanRecord {
  id: string;
  loanId: string; // NC-LN-2026-XXXX
  applicationId: string;
  agreementId?: string;
  borrowerName: string;
  borrowerMobile: string;
  borrowerEmail: string;
  principalAmount: number;
  interestRateAnnual: number;
  totalPayable: number;
  totalPaid: number;
  outstandingBalance: number;
  tenureMonths: number;
  disbursementDate: string;
  repaymentFrequency: RepaymentFrequency;
  nextDueDate: string;
  status: LoanStatus;
  schedule: RepaymentInstallment[];
  repayments: {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionReference: string;
    recordedBy: string;
    receiptId: string;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action:
    | "APPLICATION_CREATED"
    | "APPLICATION_VIEWED"
    | "STATUS_CHANGED"
    | "DOCUMENT_ACCESSED"
    | "AGREEMENT_GENERATED"
    | "AGREEMENT_SIGNED"
    | "EMAIL_SENT"
    | "ADMIN_NOTE_ADDED"
    | "INFO_REQUESTED"
    | "PAYMENT_RECORDED"
    | "LOAN_ACTIVATED"
    | "MANUAL_LOAN_CREATED"
    | "LOAN_UPDATED"
    | "LOAN_DELETED"
    | "CONTACT_MESSAGE_SENT"
    | "ADMIN_LOGIN";
  targetId: string;
  targetType: "APPLICATION" | "AGREEMENT" | "LOAN" | "DOCUMENT" | "USER";
  metadata?: Record<string, unknown>;
}

export interface EmailLogEntry {
  id: string;
  recipient: string;
  emailType: string;
  subject: string;
  applicationId?: string;
  sentAt: string;
  status: "SENT" | "FAILED" | "SIMULATED";
  providerMessageId?: string;
  errorMessage?: string;
}
