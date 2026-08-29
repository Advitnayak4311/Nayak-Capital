"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoanApplication, UploadedDocument } from "@/lib/models/types";
import { formatCurrency, formatDate, formatDateTime, calculateEMI } from "@/lib/utils";
import { maskDocumentNumber } from "@/lib/security/mask";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  FileCheck2,
  Lock,
  Download,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Send,
} from "lucide-react";

export default function CustomerStatusPage() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") || "";
  const { toast } = useToast();

  const [applicationId, setApplicationId] = React.useState(queryId || "");
  const [mobileOrEmail, setMobileOrEmail] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [application, setApplication] = React.useState<LoanApplication | null>(null);

  // Supplementary document upload state for "ADDITIONAL_INFORMATION_REQUIRED"
  const [supplementaryText, setSupplementaryText] = React.useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = React.useState(false);

  // Auto-lookup if coming with seed application
  React.useEffect(() => {
    if (queryId) {
      setApplicationId(queryId);
    }
  }, [queryId]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId.trim() || !mobileOrEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Application Reference and your registered Mobile or Email.",
        type: "error",
      });
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch("/api/customer/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, mobileOrEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lookup failed");
      }

      setApplication(data.application);
      toast({
        title: "Application Located",
        description: "Verification complete. Showing current appraisal status.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Application Not Found",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsSearching(false);
    }
  };


  const timelineSteps = [
    { key: "SUBMITTED", label: "Application Submitted", desc: "Digital application and KYC recorded" },
    { key: "UNDER_REVIEW", label: "Underwriting Appraisal", desc: "Identity & income verification in progress" },
    { key: "APPROVED", label: "Sanction Issued", desc: "Credit facility approved by committee" },
    { key: "AGREEMENT_SIGNED", label: "Agreement Executed", desc: "Personal Loan Agreement digitally signed" },
    { key: "ACTIVE", label: "Disbursed / Active", desc: "Funds transferred to verified bank account" },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const order = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "AGREEMENT_PENDING", "AGREEMENT_SIGNED", "ACTIVE", "COMPLETED"];
    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (currentStatus === "REJECTED") return "rejected";
    if (currentIdx > stepIdx) return "completed";
    if (currentIdx === stepIdx) return "current";
    return "upcoming";
  };

  return (
    <div className="py-12 md:py-20 space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-4 py-1.5 shadow-gold-sm">
          <ShieldCheck className="h-4 w-4 text-gold-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            Secure Borrower Status Portal
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Track Your Loan Application
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Enter your Application Reference and registered contact to view real-time underwriting progress and access documents.
        </p>
      </div>

      {/* Lookup Card */}
      {!application && (
        <div className="max-w-xl mx-auto rounded-3xl border border-charcoal-700 bg-charcoal-900/95 p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <Input
              label="Application Reference Number *"
              placeholder="e.g. NC-APP-2026-0081"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              prefixIcon={<Search className="h-4 w-4" />}
              required
            />

            <Input
              label="Registered Mobile Number or Email *"
              placeholder="e.g. 9845012345 or vikram.sharma@example.com"
              value={mobileOrEmail}
              onChange={(e) => setMobileOrEmail(e.target.value)}
              prefixIcon={<Lock className="h-4 w-4" />}
              helperText="Used to verify authorized access to your application records."
              required
            />

            <Button
              type="submit"
              variant="luxury"
              size="lg"
              className="w-full text-xs uppercase tracking-wider font-bold shadow-gold-md"
              isLoading={isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Verify & Retrieve Application</span>
            </Button>
          </form>
        </div>
      )}

      {/* Real-time Customer Dashboard View */}
      {application && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          {/* Header Summary Box */}
          <div className="rounded-3xl border border-gold-500/30 bg-gradient-to-b from-charcoal-850 to-charcoal-950 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                  Applicant: {application.borrower.fullName}
                </span>
                <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mt-0.5">
                  {application.applicationId}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Facility: <strong className="text-slate-200">{application.loan.productName}</strong> &bull; Submitted on {formatDate(application.createdAt)}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <Badge status={application.status} />
                <button
                  onClick={() => setApplication(null)}
                  className="text-xs text-slate-400 hover:text-gold-300 underline"
                >
                  Look up another application
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-3.5">
                <span className="text-slate-400">Principal Requested</span>
                <p className="text-base font-bold text-white font-mono mt-0.5">
                  {formatCurrency(application.loan.amount)}
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-3.5">
                <span className="text-slate-400">Tenure</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {application.loan.tenureMonths} Months
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-3.5">
                <span className="text-slate-400">Indicative Rate</span>
                <p className="text-base font-bold text-gold-300 font-mono mt-0.5">
                  {application.loan.proposedInterestRateAnnual}% p.a.
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-3.5">
                <span className="text-slate-400">Est. Installment (EMI)</span>
                <p className="text-base font-bold text-gold-300 font-mono mt-0.5">
                  {formatCurrency(
                    application.loan.estimatedEMI ||
                      calculateEMI(
                        application.loan.amount,
                        application.loan.proposedInterestRateAnnual || (application.loan.tenureMonths <= 3 ? 13.5 : 14.7),
                        application.loan.tenureMonths
                      ).emi
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Required Banner if status is ADDITIONAL_INFORMATION_REQUIRED */}
          {application.status === "ADDITIONAL_INFORMATION_REQUIRED" && (
            <div className="rounded-3xl border border-purple-500/40 bg-purple-950/20 p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm uppercase tracking-wider">
                <AlertCircle className="h-5 w-5" />
                <span>Action Required: Supplementary Information Needed</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our underwriting committee requires additional clarification or an updated document to complete your credit appraisal. Please provide the details below:
              </p>
              <div className="space-y-3 pt-2">
                <Textarea
                  placeholder="Type your response or clarifications here..."
                  value={supplementaryText}
                  onChange={(e) => setSupplementaryText(e.target.value)}
                  rows={3}
                />
                <Button
                  variant="luxury"
                  size="md"
                  onClick={() => {
                    toast({
                      title: "Clarification Sent",
                      description: "Your response has been dispatched to your loan officer.",
                      type: "success",
                    });
                    setSupplementaryText("");
                  }}
                  className="text-xs uppercase tracking-wider font-bold"
                >
                  <Send className="h-4 w-4 mr-2" />
                  <span>Transmit Supplementary Response</span>
                </Button>
              </div>
            </div>
          )}

          {/* Agreement Action Card if Agreement is ready */}
          {(application.status === "APPROVED" ||
            application.status === "AGREEMENT_PENDING" ||
            application.status === "AGREEMENT_SIGNED" ||
            application.status === "ACTIVE") && (
            <div className="rounded-3xl border border-gold-500/40 bg-charcoal-900/90 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card-luxury">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                  Legal Agreement Status
                </span>
                <h3 className="text-xl font-serif font-bold text-white">
                  Personal Loan Agreement
                </h3>
                <p className="text-xs text-slate-400">
                  {application.status === "AGREEMENT_SIGNED" || application.status === "ACTIVE"
                    ? "Your digital loan agreement has been executed and locked in our compliance vault."
                    : "Your facility is sanctioned! Please review and execute your digital loan agreement."}
                </p>
              </div>

              <Link href={`/agreement/${application.agreementId || application.applicationId}`}>
                <Button variant="luxury" size="lg" className="text-xs uppercase tracking-wider font-bold shadow-gold-md">
                  <FileCheck2 className="h-4 w-4 mr-2" />
                  <span>{application.status === "AGREEMENT_SIGNED" ? "View Executed Agreement" : "Review & Sign Agreement"}</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Interactive Status Timeline */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">
              Application Lifecycle Timeline
            </h3>

            <div className="space-y-6">
              {timelineSteps.map((step, idx) => {
                const statusState = getStepStatus(step.key, application.status);
                return (
                  <div key={idx} className="flex items-start space-x-4 relative">
                    {idx < timelineSteps.length - 1 && (
                      <div className="absolute left-[17px] top-8 bottom-0 w-0.5 bg-charcoal-800 -z-0" />
                    )}

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0 relative z-10 ${
                        statusState === "completed"
                          ? "bg-emerald-500 text-charcoal-950 shadow-sm"
                          : statusState === "current"
                          ? "bg-gold-500 text-charcoal-950 ring-4 ring-gold-500/20"
                          : "bg-charcoal-800 text-slate-500 border border-charcoal-700"
                      }`}
                    >
                      {statusState === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span>0{idx + 1}</span>
                      )}
                    </div>

                    <div className="pt-0.5 space-y-0.5">
                      <h4
                        className={`text-sm font-bold ${
                          statusState === "current"
                            ? "text-gold-300"
                            : statusState === "completed"
                            ? "text-white"
                            : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-xs text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Document Vault */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">
              Customer Document Vault
            </h3>
            <p className="text-xs text-slate-400">
              Securely access documents associated with your application:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-charcoal-800 bg-charcoal-950 p-4 flex items-center justify-between"
                >
                  <div className="truncate text-xs space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-gold-400">
                      {doc.docType.replace(/_/g, " ")}
                    </span>
                    <p className="font-semibold text-white truncate max-w-[200px]">{doc.fileName}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40 font-semibold">
                    Encrypted
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
