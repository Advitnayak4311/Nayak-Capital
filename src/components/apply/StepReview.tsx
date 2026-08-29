"use client";

import * as React from "react";
import {
  BorrowerDetails,
  LoanRequestedDetails,
  KycDetails,
  IncomeDetails,
  GuarantorDetails,
  UploadedDocument,
  ConsentRecord,
} from "@/lib/models/types";
import { BORROWER_CONSENT_CLAUSES, BORROWER_DECLARATION_VERSION } from "@/config/legal";
import { formatCurrency } from "@/lib/utils";
import { maskDocumentNumber } from "@/lib/security/mask";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { SignaturePad, SignatureData } from "@/components/ui/SignaturePad";
import { SignedDeclarationPdfModal } from "./SignedDeclarationPdfModal";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ShieldCheck,
  FileCheck2,
  Printer,
  FileText,
  AlertCircle,
} from "lucide-react";

interface StepReviewProps {
  formData: {
    borrower: BorrowerDetails;
    loan: LoanRequestedDetails;
    kyc: KycDetails;
    income: IncomeDetails;
    guarantor: GuarantorDetails;
    documents: UploadedDocument[];
    consent?: ConsentRecord;
  };
  onEditStep: (stepNumber: number) => void;
  onConsentChange: (consent: ConsentRecord) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export function StepReview({
  formData,
  onEditStep,
  onConsentChange,
  onSubmit,
  onPrev,
  isSubmitting,
  errors,
}: StepReviewProps) {
  const [consentAcknowledged, setConsentAcknowledged] = React.useState(
    formData.consent?.consentGiven || false
  );
  const [signatureData, setSignatureData] = React.useState<SignatureData | null>(
    formData.consent
      ? {
          type: formData.consent.signatureType,
          data: formData.consent.signatureData,
          fullName: formData.consent.signerFullName,
          timestamp: formData.consent.consentTimestamp,
        }
      : null
  );
  const [showPdfModal, setShowPdfModal] = React.useState(false);

  const handleSignatureCapture = (sig: SignatureData | null) => {
    if (!sig) {
      setSignatureData(null);
      onConsentChange({
        consentGiven: false,
        consentVersion: BORROWER_DECLARATION_VERSION,
        consentTimestamp: new Date().toISOString(),
        signatureType: "DRAWN",
        signatureData: "",
        signerFullName: formData.borrower.fullName,
      });
      return;
    }
    setSignatureData(sig);
    if (consentAcknowledged) {
      onConsentChange({
        consentGiven: true,
        consentVersion: BORROWER_DECLARATION_VERSION,
        consentTimestamp: sig.timestamp || new Date().toISOString(),
        signatureType: sig.type,
        signatureData: sig.data,
        signerFullName: sig.fullName || formData.borrower.fullName,
      });
    }
  };

  const handleConsentToggle = (checked: boolean) => {
    setConsentAcknowledged(checked);
    if (checked && signatureData?.data) {
      onConsentChange({
        consentGiven: true,
        consentVersion: BORROWER_DECLARATION_VERSION,
        consentTimestamp: signatureData.timestamp || new Date().toISOString(),
        signatureType: signatureData.type,
        signatureData: signatureData.data,
        signerFullName: signatureData.fullName || formData.borrower.fullName,
      });
    } else {
      onConsentChange({
        consentGiven: false,
        consentVersion: BORROWER_DECLARATION_VERSION,
        consentTimestamp: new Date().toISOString(),
        signatureType: signatureData?.type || "DRAWN",
        signatureData: signatureData?.data || "",
        signerFullName: signatureData?.fullName || formData.borrower.fullName,
      });
    }
  };

  const isSignComplete = consentAcknowledged && !!signatureData?.data;

  return (
    <div className="space-y-8">
      <div className="border-b border-charcoal-800 pb-4">
        <h2 className="text-xl font-serif font-bold text-white">
          Step 7: Application Review & Borrower Declaration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review your submitted information carefully before providing your mandatory electronic consent and signature.
        </p>
      </div>

      {/* Summary Review Grid */}
      <div className="space-y-4">
        {/* Borrower Section */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
              1. Borrower Details
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
              className="text-xs text-slate-400 hover:text-gold-300 h-7"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Full Name:</span>
              <p className="font-semibold text-white mt-0.5">{formData.borrower.fullName}</p>
            </div>
            <div>
              <span className="text-slate-500">Date of Birth:</span>
              <p className="font-semibold text-white mt-0.5">{formData.borrower.dob}</p>
            </div>
            <div>
              <span className="text-slate-500">Mobile:</span>
              <p className="font-semibold text-white mt-0.5">{formData.borrower.mobile}</p>
            </div>
            <div>
              <span className="text-slate-500">Email:</span>
              <p className="font-semibold text-white mt-0.5 truncate">{formData.borrower.email}</p>
            </div>
          </div>
          <div className="text-xs pt-1">
            <span className="text-slate-500">Residential Address:</span>
            <p className="text-slate-300 mt-0.5">{formData.borrower.currentAddress}</p>
          </div>
        </div>

        {/* Loan Section */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
              2. Facility Request
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              className="text-xs text-slate-400 hover:text-gold-300 h-7"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Facility Type:</span>
              <p className="font-semibold text-white mt-0.5">{formData.loan.productName}</p>
            </div>
            <div>
              <span className="text-slate-500">Requested Principal:</span>
              <p className="font-bold text-gold-300 mt-0.5 font-mono">
                {formatCurrency(formData.loan.amount)}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Tenure:</span>
              <p className="font-semibold text-white mt-0.5">{formData.loan.tenureMonths} Months</p>
            </div>
            <div>
              <span className="text-slate-500">Repayment Frequency:</span>
              <p className="font-semibold text-white mt-0.5">
                {formData.loan.repaymentFrequency === "BULLET"
                  ? "Lump Sum Settlement at End"
                  : formData.loan.repaymentFrequency}
              </p>
            </div>
          </div>
        </div>

        {/* KYC & Income Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-charcoal-800 pb-1.5">
              <h3 className="font-bold uppercase tracking-wider text-gold-400">3. KYC Disclosures</h3>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="text-slate-400 hover:text-gold-300"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500">Document Type:</span>
                <p className="font-semibold text-white">{formData.kyc.documentType}</p>
              </div>
              <div>
                <span className="text-slate-500">ID Number (Masked):</span>
                <p className="font-semibold text-gold-300 font-mono">
                  {maskDocumentNumber(formData.kyc.documentType, formData.kyc.documentNumber)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-charcoal-800 pb-1.5">
              <h3 className="font-bold uppercase tracking-wider text-gold-400">4. Income & Disbursement</h3>
              <button
                type="button"
                onClick={() => onEditStep(4)}
                className="text-slate-400 hover:text-gold-300"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500">Employment:</span>
                <p className="font-semibold text-white">
                  {formData.income.occupationType} &bull; {formatCurrency(formData.income.monthlyIncome)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Disbursement Channel:</span>
                <p className="font-semibold text-gold-300">
                  {formData.income.disbursementMode === "UPI"
                    ? `UPI: ${formData.income.upiId}`
                    : formData.income.disbursementMode === "CASH"
                    ? `Cash: ${formData.income.cashPreferredCity}`
                    : `Bank: ${formData.income.primaryBankName || "NEFT/IMPS"}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Attached */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-charcoal-800 pb-1.5">
            <h3 className="font-bold uppercase tracking-wider text-gold-400">
              5. Encrypted Documents ({formData.documents.length} attached)
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(6)}
              className="text-slate-400 hover:text-gold-300"
            >
              <Edit3 className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.documents.map((doc) => (
              <span
                key={doc.id}
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-charcoal-800 text-slate-300 text-[11px] border border-charcoal-700"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400 mr-1.5" />
                {doc.docType.replace(/_/g, " ")}: {doc.fileName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* PHASE 3: BORROWER CONSENT & DECLARATION */}
      {/* ==================================================== */}
      <div className="rounded-3xl border border-gold-500/40 bg-charcoal-950 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-gold-500/20 pb-4">
          <div className="flex items-center space-x-2 text-gold-400 mb-1">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Legal Authorization & Declaration
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-white">
            6. BORROWER CONSENT & DECLARATION
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Please read the following declaration carefully before providing your mandatory signature. (Version {BORROWER_DECLARATION_VERSION})
          </p>
        </div>

        {/* Declaration Clauses */}
        <div className="max-h-64 overflow-y-auto space-y-4 pr-2 rounded-xl bg-charcoal-900/60 p-4 border border-charcoal-800 text-xs text-slate-300 leading-relaxed">
          {BORROWER_CONSENT_CLAUSES.map((clause, idx) => (
            <div key={clause.id} className="space-y-1">
              <h4 className="font-bold text-gold-300">{clause.title}</h4>
              <p className="text-slate-300">{clause.content}</p>
            </div>
          ))}
        </div>

        {/* Mandatory Explicit Acknowledgement Checkbox */}
        <div className="rounded-xl border border-gold-500/30 bg-charcoal-900/90 p-4">
          <Checkbox
            id="borrower-consent-check"
            checked={consentAcknowledged}
            onChange={(e) => handleConsentToggle(e.target.checked)}
            label={
              <span className="text-xs font-bold text-white leading-relaxed">
                Customer Acknowledgement: I have read and understood the above declaration and consent to the stated loan-related processing. *
              </span>
            }
            description="Compulsory: Confirms accurate details, verification authorization, late payment penalty charges, and lender recovery covenants."
          />
        </div>

        {/* Digital Signature Component */}
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
            Borrower Electronic Signature (Compulsory) *
          </label>
          <SignaturePad
            signerFullName={formData.borrower.fullName}
            onSignatureCapture={handleSignatureCapture}
            initialSignature={signatureData || undefined}
          />
        </div>

        {/* Instant PDF Document Download Button when Signed */}
        {isSignComplete && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Signed Declaration Form Generated
                </h4>
                <p className="text-[11px] text-slate-400">
                  Your complete signed application and declaration PDF is ready for immediate download.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowPdfModal(true)}
              className="text-xs font-bold uppercase tracking-wider shrink-0 shadow-sm"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              <span>Download / Preview PDF</span>
            </Button>
          </div>
        )}

        {/* Notice of Separate Personal Loan Agreement */}
        <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/50 p-4 flex items-start space-x-3 text-xs text-slate-400">
          <FileCheck2 className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
          <span>
            <strong>Important Notice:</strong> This Consent & Declaration authorizes application evaluation and data processing. Upon underwriting sanction, a formal <strong>Personal Loan Agreement</strong> detailing finalized installment dates and covenants will be generated for formal execution.
          </span>
        </div>

        {errors.consent && (
          <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-800/40">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.consent}</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-charcoal-800">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onPrev}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Documents</span>
        </Button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {isSignComplete && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowPdfModal(true)}
              className="w-full sm:w-auto text-xs uppercase tracking-wider"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              <span>Download / View PDF</span>
            </Button>
          )}

          <Button
            type="button"
            variant="luxury"
            size="lg"
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={!consentAcknowledged || !signatureData}
            className="w-full sm:w-auto text-xs uppercase tracking-wider font-bold shadow-gold-md"
          >
            <span>Submit Application</span>
          </Button>
        </div>
      </div>

      {/* Signed PDF Modal */}
      <SignedDeclarationPdfModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        borrower={formData.borrower}
        loan={formData.loan}
        kyc={formData.kyc}
        income={formData.income}
        consent={
          signatureData
            ? {
                consentGiven: true,
                consentVersion: BORROWER_DECLARATION_VERSION,
                consentTimestamp: signatureData.timestamp || new Date().toISOString(),
                signatureType: signatureData.type,
                signatureData: signatureData.data,
                signerFullName: signatureData.fullName || formData.borrower.fullName,
              }
            : undefined
        }
      />
    </div>
  );
}
