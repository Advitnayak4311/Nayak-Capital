"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BorrowerDetails,
  LoanRequestedDetails,
  KycDetails,
  IncomeDetails,
  GuarantorDetails,
  UploadedDocument,
  ConsentRecord,
} from "@/lib/models/types";
import {
  borrowerDetailsSchema,
  loanDetailsSchema,
  kycDetailsSchema,
  incomeDetailsSchema,
  guarantorDetailsSchema,
  uploadedDocumentSchema,
  consentRecordSchema,
} from "@/lib/validation/applicationSchema";
import { LOAN_PRODUCTS } from "@/config/loans";
import { StepIndicator } from "@/components/apply/StepIndicator";
import { StepBorrower } from "@/components/apply/StepBorrower";
import { StepLoan } from "@/components/apply/StepLoan";
import { StepKyc } from "@/components/apply/StepKyc";
import { StepIncome } from "@/components/apply/StepIncome";
import { StepGuarantor } from "@/components/apply/StepGuarantor";
import { StepDocuments } from "@/components/apply/StepDocuments";
import { StepReview } from "@/components/apply/StepReview";
import { useToast } from "@/components/ui/Toast";
import { ShieldCheck, Lock, Sparkles } from "lucide-react";

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form state
  const [borrower, setBorrower] = React.useState<BorrowerDetails>({
    fullName: "",
    dob: "",
    fatherOrSpouseName: "",
    mobile: "",
    email: "",
    currentAddress: "",
    permanentAddress: "",
    occupation: "",
    employerOrBusinessName: "",
  });

  const [loan, setLoan] = React.useState<LoanRequestedDetails>(() => {
    const prodId = searchParams.get("product") || "personal-prime";
    const prod = LOAN_PRODUCTS.find((p) => p.id === prodId) || LOAN_PRODUCTS[0];
    const queryAmount = Number(searchParams.get("amount")) || 500000;
    const queryTenure = Number(searchParams.get("tenure")) || 24;
    const queryRate = Number(searchParams.get("rate")) || prod.baseInterestRateAnnual;

    return {
      productId: prod.id,
      productName: prod.name,
      amount: queryAmount,
      tenureMonths: queryTenure,
      purpose: "",
      repaymentFrequency: "MONTHLY",
      proposedDisbursementDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      proposedInterestRateAnnual: queryRate,
      proposedProcessingFeePercent: prod.processingFeePercent,
      calculationMethod: "REDUCING_BALANCE",
    };
  });

  const [kyc, setKyc] = React.useState<KycDetails>({
    documentType: "AADHAAR",
    documentNumber: "",
    panNumber: "",
  });

  const [income, setIncome] = React.useState<IncomeDetails>({
    occupationType: "SALARIED",
    monthlyIncome: 120000,
    existingLoanObligationsMonthly: 0,
    primaryBankName: "",
    primaryAccountNumber: "",
    ifscCode: "",
  });

  const [guarantor, setGuarantor] = React.useState<GuarantorDetails>({
    hasGuarantor: false,
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    relationship: "",
    occupation: "",
  });

  const [documents, setDocuments] = React.useState<UploadedDocument[]>([]);
  const [consent, setConsent] = React.useState<ConsentRecord | undefined>(undefined);

  const stepTitles = [
    "Personal",
    "Loan",
    "KYC",
    "Income",
    "Guarantor",
    "Documents",
    "Review & Sign",
  ];

  // Validation logic per step
  const validateCurrentStep = (): boolean => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      const res = borrowerDetailsSchema.safeParse(borrower);
      if (!res.success) {
        res.error.errors.forEach((err) => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
        toast({
          title: "Incomplete Details",
          description: "Please complete all mandatory personal fields.",
          type: "error",
        });
        return false;
      }
    } else if (currentStep === 2) {
      const res = loanDetailsSchema.safeParse(loan);
      if (!res.success) {
        res.error.errors.forEach((err) => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
        toast({
          title: "Incomplete Loan Parameters",
          description: "Please specify amount, purpose, and preferred dates.",
          type: "error",
        });
        return false;
      }
    } else if (currentStep === 3) {
      const res = kycDetailsSchema.safeParse(kyc);
      if (!res.success) {
        res.error.errors.forEach((err) => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
        toast({
          title: "Incomplete KYC",
          description: "Please provide valid Document ID and PAN details.",
          type: "error",
        });
        return false;
      }
    } else if (currentStep === 4) {
      const res = incomeDetailsSchema.safeParse(income);
      if (!res.success) {
        res.error.errors.forEach((err) => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
        toast({
          title: "Incomplete Income Disclosures",
          description: "Please provide monthly income and bank details.",
          type: "error",
        });
        return false;
      }
    } else if (currentStep === 5) {
      if (guarantor.hasGuarantor) {
        if (!guarantor.fullName || !guarantor.mobile || !guarantor.relationship) {
          newErrors["guarantor.fullName"] = "Guarantor Name, Mobile and Relationship are required.";
          setErrors(newErrors);
          toast({
            title: "Guarantor Details Required",
            description: "Please provide guarantor contact and relationship details.",
            type: "error",
          });
          return false;
        }
      }
    } else if (currentStep === 6) {
      const hasPhoto = documents.some((d) => d.docType === "PHOTO" || d.docType === "LIVE_PHOTO");
      const hasPan = documents.some((d) => d.docType === "PAN_CARD");
      const hasId = documents.some((d) => d.docType === "IDENTITY_PROOF");

      if (!hasPhoto || !hasPan || !hasId) {
        const missing = [];
        if (!hasPhoto) missing.push("Live Photo");
        if (!hasPan) missing.push("PAN Card");
        if (!hasId) missing.push("Government ID Proof");
        newErrors["documents"] = `Compulsory documents missing: ${missing.join(", ")}.`;
        setErrors(newErrors);
        toast({
          title: "Compulsory Documents Required",
          description: `Please attach ${missing.join(", ")}.`,
          type: "error",
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitApplication = async () => {
    if (!consent || !consent.consentGiven || !consent.signatureData) {
      toast({
        title: "Consent & Signature Required",
        description: "Please acknowledge the declaration and apply your digital signature.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        borrower,
        loan,
        kyc,
        income,
        guarantor,
        documents,
        consent,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Submission failed");
      }

      toast({
        title: "Application Successfully Submitted",
        description: `Your application reference is ${result.applicationId}`,
        type: "success",
      });

      router.push(`/apply/success?id=${result.applicationId}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      toast({
        title: "Submission Error",
        description: err.message || "Failed to submit application. Please check your inputs.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Pill & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-4 py-1 shadow-gold-sm">
            <ShieldCheck className="h-4 w-4 text-gold-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Encrypted Credit Application Desk
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Apply for Credit Facility
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Complete the 7-step institutional application. Your information is protected under 256-bit encryption.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={7}
          stepTitles={stepTitles}
          onStepClick={handleEditStep}
        />

        {/* Multi-step Form Card Container */}
        <div className="rounded-3xl border border-charcoal-700 bg-charcoal-900/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {currentStep === 1 && (
            <StepBorrower
              data={borrower}
              onChange={(updated) => setBorrower((prev) => ({ ...prev, ...updated }))}
              onNext={handleNext}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <StepLoan
              data={loan}
              onChange={(updated) => setLoan((prev) => ({ ...prev, ...updated }))}
              onNext={handleNext}
              onPrev={handlePrev}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <StepKyc
              data={kyc}
              onChange={(updated) => setKyc((prev) => ({ ...prev, ...updated }))}
              onNext={handleNext}
              onPrev={handlePrev}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <StepIncome
              data={income}
              onChange={(updated) => setIncome((prev) => ({ ...prev, ...updated }))}
              onNext={handleNext}
              onPrev={handlePrev}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <StepGuarantor
              data={guarantor}
              onChange={(updated) => setGuarantor((prev) => ({ ...prev, ...updated }))}
              onNext={handleNext}
              onPrev={handlePrev}
              errors={errors}
            />
          )}

          {currentStep === 6 && (
            <StepDocuments
              documents={documents}
              onChange={setDocuments}
              onNext={handleNext}
              onPrev={handlePrev}
              errors={errors}
            />
          )}

          {currentStep === 7 && (
            <StepReview
              formData={{
                borrower,
                loan,
                kyc,
                income,
                guarantor,
                documents,
                consent,
              }}
              onEditStep={handleEditStep}
              onConsentChange={setConsent}
              onSubmit={handleSubmitApplication}
              onPrev={handlePrev}
              isSubmitting={isSubmitting}
              errors={errors}
            />
          )}
        </div>

        {/* Security & Confidentiality Footer Note */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5 text-gold-500/70" />
          <span>256-Bit SSL Encrypted &bull; Strictly Confidential Financial Appraisal</span>
        </div>
      </div>
    </div>
  );
}
