"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LoanApplication, ApplicationStatus } from "@/lib/models/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { maskAadhaar, maskPAN, maskDocumentNumber } from "@/lib/security/mask";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  FileText,
  Landmark,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Lock,
  Download,
  ExternalLink,
  MessageSquare,
  FileCheck2,
  Calendar,
} from "lucide-react";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = (params.id as string) || "";
  const { toast } = useToast();

  const [application, setApplication] = React.useState<LoanApplication | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [isAddingNote, setIsAddingNote] = React.useState(false);

  // Unmask sensitive state
  const [isAadhaarUnmasked, setIsAadhaarUnmasked] = React.useState(false);
  const [isPanUnmasked, setIsPanUnmasked] = React.useState(false);

  // Status transition form
  const [selectedStatus, setSelectedStatus] = React.useState<ApplicationStatus>("UNDER_REVIEW");
  const [statusNote, setStatusNote] = React.useState("");

  // Internal note form
  const [newNoteContent, setNewNoteContent] = React.useState("");

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = React.useState<any | null>(null);

  const fetchApplication = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setApplication(data.application);
        setSelectedStatus(data.application.status);
      }
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  React.useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStatusUpdate = async () => {
    if (!application) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/applications/${application.applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          note: statusNote,
          changedBy: "Chief Credit Underwriter",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      toast({
        title: "Application Status Updated",
        description: `Status changed to ${selectedStatus}`,
        type: "success",
      });

      setApplication(data.application);
      setStatusNote("");
    } catch (err: any) {
      toast({
        title: "Status Update Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !application) return;

    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/applications/${application.applicationId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newNoteContent,
          authorName: "Chief Credit Underwriter",
          authorId: "admin-master-01",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add note");
      }

      toast({
        title: "Internal Note Added",
        description: "Note recorded in compliance log.",
        type: "success",
      });

      setApplication(data.application);
      setNewNoteContent("");
    } catch (err: any) {
      toast({
        title: "Note Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Loading 360° Application File...
        </p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Application Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested application ID ({applicationId}) does not exist in the active registry.
        </p>
        <Link href="/admin/applications">
          <Button variant="secondary" size="md">
            Return to Applications
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/admin/applications">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400 hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Applications Grid</span>
              </Button>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-xs font-bold text-gold-300">
              {application.applicationId}
            </span>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <h1 className="text-2xl font-serif font-bold text-white">
              {application.borrower.fullName}
            </h1>
            <Badge status={application.status} />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href={`/agreement/${application.agreementId || application.applicationId}`}>
            <Button variant="luxury" size="sm" className="text-xs uppercase tracking-wider font-bold">
              <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Personal Loan Agreement</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 360 Degree Application Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Dossier Information */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Borrower Information */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>1. Borrower Demographics & Contacts</span>
              </h3>
              <span className="text-xs text-slate-500">
                Submitted: {formatDate(application.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Full Legal Name:</span>
                <p className="font-bold text-white text-sm mt-0.5">{application.borrower.fullName}</p>
              </div>
              <div>
                <span className="text-slate-400">Date of Birth:</span>
                <p className="font-semibold text-white mt-0.5">{application.borrower.dob}</p>
              </div>
              <div>
                <span className="text-slate-400">Relative / Spouse:</span>
                <p className="font-semibold text-white mt-0.5">{application.borrower.fatherOrSpouseName}</p>
              </div>
              <div>
                <span className="text-slate-400">Mobile Phone:</span>
                <p className="font-semibold text-white mt-0.5">{application.borrower.mobile}</p>
              </div>
              <div>
                <span className="text-slate-400">Email Address:</span>
                <p className="font-semibold text-white mt-0.5">{application.borrower.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Occupation / Firm:</span>
                <p className="font-semibold text-white mt-0.5">{application.borrower.occupation}</p>
              </div>
            </div>

            <div className="pt-2 text-xs space-y-1">
              <span className="text-slate-400">Residential Address:</span>
              <p className="text-slate-200 bg-charcoal-950/60 p-3 rounded-xl border border-charcoal-800 leading-relaxed">
                {application.borrower.currentAddress}
              </p>
            </div>
          </div>

          {/* Section 2: Facility Parameters */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
                <Landmark className="h-4 w-4" />
                <span>2. Requested Facility Parameters</span>
              </h3>
              <span className="text-xs font-mono font-bold text-gold-300">
                {application.loan.productName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Principal Sum</span>
                <p className="text-base font-bold text-white font-mono mt-0.5">
                  {formatCurrency(application.loan.amount)}
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Tenure</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {application.loan.tenureMonths} Months
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Indicative Rate</span>
                <p className="text-base font-bold text-gold-300 font-mono mt-0.5">
                  {application.loan.proposedInterestRateAnnual}% p.a.
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Monthly EMI</span>
                <p className="text-base font-bold text-gold-300 font-mono mt-0.5">
                  {formatCurrency(application.loan.estimatedEMI || 0)}
                </p>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-slate-400">Declared Purpose of Funds:</span>
              <p className="text-slate-200 bg-charcoal-950/60 p-3 rounded-xl border border-charcoal-800">
                {application.loan.purpose}
              </p>
            </div>
          </div>

          {/* Section 3: KYC & Masked Identity Verification */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4" />
                <span>3. Identity & KYC Verification</span>
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAadhaarUnmasked(!isAadhaarUnmasked)}
                  className="h-7 text-[11px]"
                >
                  {isAadhaarUnmasked ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  {isAadhaarUnmasked ? "Mask Document ID" : "Unmask Document ID"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950/60 p-4 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">
                  {application.kyc.documentType} Number
                </span>
                <p className="text-sm font-mono font-bold text-white mt-0.5">
                  {isAadhaarUnmasked
                    ? application.kyc.documentNumber
                    : maskDocumentNumber(application.kyc.documentType, application.kyc.documentNumber)}
                </p>
              </div>

              <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950/60 p-4 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">
                  Permanent Account Number (PAN)
                </span>
                <p className="text-sm font-mono font-bold text-white mt-0.5">
                  {isAadhaarUnmasked
                    ? application.kyc.panNumber || application.kyc.documentNumber
                    : maskPAN(application.kyc.panNumber || application.kyc.documentNumber)}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Income & Disbursement Preferences */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="border-b border-charcoal-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
                <Landmark className="h-4 w-4" />
                <span>4. Income & Disbursement Preference</span>
              </h3>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
                Mode: {application.income?.disbursementMode || "BANK_TRANSFER"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Employment Status</span>
                <p className="font-semibold text-white mt-0.5">{application.income?.occupationType}</p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Monthly Inflow</span>
                <p className="font-semibold text-gold-300 font-mono mt-0.5">
                  {formatCurrency(application.income?.monthlyIncome || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Existing Obligations</span>
                <p className="font-semibold text-slate-300 font-mono mt-0.5">
                  {formatCurrency(application.income?.existingLoanObligationsMonthly || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3">
                <span className="text-slate-400">Disbursement Channel</span>
                <p className="font-bold text-gold-400 mt-0.5">
                  {application.income?.disbursementMode === "UPI"
                    ? `UPI: ${application.income.upiId}`
                    : application.income?.disbursementMode === "CASH"
                    ? `Cash: ${application.income.cashPreferredCity || "Desk Handover"}`
                    : `Bank: ${application.income?.primaryBankName || "NEFT/RTGS"}`}
                </p>
              </div>
            </div>

            {application.income?.disbursementMode === "BANK_TRANSFER" && application.income.primaryAccountNumber && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-charcoal-950/70 p-3.5 rounded-xl border border-charcoal-800">
                <div>
                  <span className="text-slate-500">Bank Name:</span>
                  <p className="font-semibold text-white">{application.income.primaryBankName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Account Number:</span>
                  <p className="font-mono font-bold text-gold-300">{application.income.primaryAccountNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">IFSC Code:</span>
                  <p className="font-mono font-semibold text-white">{application.income.ifscCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Encrypted Uploaded Documents */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>5. Submitted Verification Documents ({application.documents.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-charcoal-800 bg-charcoal-950 p-4 flex items-center justify-between"
                >
                  <div className="truncate text-xs space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-gold-400">
                      {doc.docType.replace(/_/g, " ")}
                    </span>
                    <p className="font-semibold text-white truncate max-w-[200px]">
                      {doc.fileName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {(doc.fileSize / 1024).toFixed(1)} KB &bull; Encrypted
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewDoc(doc)}
                    className="h-7 text-[11px] px-2.5"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Borrower Consent & Digital Signature */}
          <div className="rounded-3xl border border-gold-500/30 bg-charcoal-900/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>5. Borrower Consent & Digital Execution Record</span>
              </h3>
            </div>

            {application.consent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-semibold">Explicit Consent Confirmed</span>
                  </div>
                  <p className="text-slate-400">
                    <strong>Version:</strong> {application.consent.consentVersion}
                  </p>
                  <p className="text-slate-400">
                    <strong>Recorded At:</strong> {formatDateTime(application.consent.consentTimestamp)}
                  </p>
                  <p className="text-slate-500 text-[10px] font-mono">
                    Audit IP: {application.consent.signerIpAddress || "127.0.0.1 (Verified)"}
                  </p>
                </div>

                <div className="rounded-xl border border-charcoal-800 bg-charcoal-950 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Registered Electronic Signature
                  </span>
                  <div className="h-14 flex items-center justify-center bg-charcoal-900 rounded-lg p-1 border border-charcoal-800">
                    {application.consent.signatureType === "DRAWN" ? (
                      <img
                        src={application.consent.signatureData}
                        alt="Signature"
                        className="max-h-12 object-contain"
                      />
                    ) : (
                      <span className="font-serif italic text-lg text-gold-300">
                        {application.consent.signatureData}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-400">
                Borrower consent record is pending submission.
              </p>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Operations Workflow & Notes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Workflow Controller */}
          <div className="rounded-3xl border border-gold-500/30 bg-charcoal-900/95 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Workflow Transition Engine
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Select Target Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
                  className="w-full h-10 rounded-lg border border-charcoal-700 bg-charcoal-950 px-3 text-xs font-semibold text-white focus:border-gold-500 focus:outline-none"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW (Appraisal)</option>
                  <option value="ADDITIONAL_INFORMATION_REQUIRED">ADDITIONAL INFO REQUIRED</option>
                  <option value="APPROVED">APPROVED (Sanction Issued)</option>
                  <option value="AGREEMENT_PENDING">AGREEMENT PENDING SIGNATURE</option>
                  <option value="AGREEMENT_SIGNED">AGREEMENT SIGNED</option>
                  <option value="ACTIVE">ACTIVE (Disbursed)</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="COMPLETED">COMPLETED (Repaid)</option>
                </select>
              </div>

              <Textarea
                placeholder="Operational notes or internal justification for this status change..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
              />

              <Button
                variant="luxury"
                size="md"
                onClick={handleStatusUpdate}
                isLoading={isUpdatingStatus}
                className="w-full text-xs uppercase tracking-wider font-bold"
              >
                Apply Status Change
              </Button>
            </div>
          </div>

          {/* Private Internal Admin Notes */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/95 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400 flex items-center space-x-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>Private Officer Notes</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2.5">
              <Textarea
                placeholder="Write private internal note (not visible to customer)..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={2}
                required
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                isLoading={isAddingNote}
                className="w-full text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                <span>Save Note</span>
              </Button>
            </form>

            {/* Note Stream */}
            <div className="space-y-2.5 pt-2 max-h-60 overflow-y-auto pr-1">
              {application.adminNotes.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No internal notes attached yet.</p>
              ) : (
                application.adminNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-charcoal-800 bg-charcoal-950 p-3 space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-gold-300">{note.authorName}</span>
                      <span className="text-slate-500">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Immutable Status History Timeline */}
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/95 p-6 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400 flex items-center space-x-1.5">
              <Clock className="h-4 w-4" />
              <span>Audit Timeline</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              {application.statusHistory.map((item, idx) => (
                <div key={idx} className="relative pl-5 pb-3 border-l-2 border-charcoal-800 last:pb-0">
                  <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-gold-400" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-[11px]">
                      {item.status.replace(/_/g, " ")}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.changedBy} &bull; {formatDateTime(item.changedAt)}
                    </p>
                    {item.note && (
                      <p className="text-[11px] text-slate-300 italic pt-0.5">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Inspection Dialog */}
      <Dialog
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.docType?.replace(/_/g, " ")}
        description={`File: ${previewDoc?.fileName}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-charcoal-950 p-4 flex items-center justify-center min-h-[260px] border border-charcoal-800">
            {previewDoc?.fileMimeType?.startsWith("image/") ? (
              <img
                src={previewDoc.fileUrl}
                alt="Document Preview"
                className="max-h-[380px] object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-center space-y-3 p-6">
                <FileText className="h-16 w-16 text-gold-400 mx-auto" />
                <p className="text-sm font-bold text-white">{previewDoc?.fileName}</p>
                <p className="text-xs text-slate-400">
                  PDF Document Stream &bull; Encrypted Verification Copy
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
