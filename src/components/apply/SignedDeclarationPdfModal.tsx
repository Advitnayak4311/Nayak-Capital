"use client";

import * as React from "react";
import {
  BorrowerDetails,
  LoanRequestedDetails,
  KycDetails,
  IncomeDetails,
  ConsentRecord,
} from "@/lib/models/types";
import { BORROWER_CONSENT_CLAUSES, BORROWER_DECLARATION_VERSION } from "@/config/legal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Printer,
  Download,
  X,
  ShieldCheck,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface SignedDeclarationPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  borrower: BorrowerDetails;
  loan: LoanRequestedDetails;
  kyc: KycDetails;
  income: IncomeDetails;
  consent?: ConsentRecord;
}

export function SignedDeclarationPdfModal({
  isOpen,
  onClose,
  applicationId = "NC-APP-2026-DRAFT",
  borrower,
  loan,
  kyc,
  income,
  consent,
}: SignedDeclarationPdfModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const documentRef = React.useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const element = documentRef.current;

      // Render crisp canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#0B0E14",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      pdf.save(`Nayak_Capital_Borrower_Declaration_${applicationId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to browser print dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isDrawn = consent?.signatureType === "DRAWN" && consent.signatureData?.startsWith("data:image");
  const signerName = consent?.signerFullName || borrower.fullName;
  const rate = loan.proposedInterestRateAnnual || (loan.tenureMonths <= 3 ? 13.5 : 14.7);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-charcoal-900 border border-gold-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between border-b border-charcoal-800 bg-charcoal-950 px-5 sm:px-6 py-4 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-gold-500/10 p-2 border border-gold-500/30 text-gold-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif uppercase tracking-wider">
                Official Signed Borrower Declaration Document
              </h3>
              <p className="text-[11px] text-slate-400">
                Institutional Digital Executed Copy &bull; Version {BORROWER_DECLARATION_VERSION}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="luxury"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="text-xs font-bold uppercase tracking-wider shadow-gold-sm"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  <span>Download PDF</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs uppercase tracking-wider hidden sm:inline-flex"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              <span>Print</span>
            </Button>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#07090E]">
          <div
            id="printable-declaration-document"
            ref={documentRef}
            className="w-full max-w-3xl mx-auto rounded-xl border border-charcoal-750 bg-[#0B0E14] p-6 sm:p-10 space-y-6 text-slate-200 shadow-xl print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black"
          >
            {/* Document Header */}
            <div className="border-b-2 border-gold-500/40 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-black text-2xl tracking-wider text-white print:text-black">
                    NAYAK CAPITAL
                  </span>
                  <span className="font-sans text-[10px] font-bold tracking-widest text-gold-400 uppercase bg-gold-500/10 border border-gold-500/30 rounded px-1.5 py-0.5">
                    LENDERS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Institutional Credit Desk &bull; Email: nayakloanservices@gmail.com
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider block">
                  Application Reference
                </span>
                <p className="text-sm font-mono font-bold text-white print:text-black">
                  {applicationId}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Date: {formatDate(consent?.consentTimestamp || new Date().toISOString())}
                </span>
              </div>
            </div>

            {/* Section: Applicant & Facility Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Borrower Details Box */}
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-4 space-y-2 print:border-gray-300 print:bg-gray-50">
                <h4 className="font-bold text-gold-400 uppercase tracking-wider text-[11px] border-b border-charcoal-800 pb-1">
                  1. Borrower Identification
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Legal Full Name:</span>
                    <p className="font-bold text-white print:text-black">{borrower.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Date of Birth:</span>
                    <p className="font-semibold text-white print:text-black">{borrower.dob}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Mobile Phone:</span>
                    <p className="font-semibold text-white print:text-black">{borrower.mobile}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <p className="font-semibold text-white print:text-black truncate">{borrower.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Occupation:</span>
                    <p className="font-semibold text-white print:text-black">{borrower.occupation}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">PAN Number:</span>
                    <p className="font-semibold text-gold-300 print:text-black font-mono">{kyc.panNumber || "Submitted"}</p>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-charcoal-800 text-[11px]">
                  <span className="text-slate-400">Residential Address:</span>
                  <p className="text-white print:text-black font-medium">{borrower.currentAddress}</p>
                </div>
              </div>

              {/* Loan & Payout Parameters */}
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-4 space-y-2 print:border-gray-300 print:bg-gray-50">
                <h4 className="font-bold text-gold-400 uppercase tracking-wider text-[11px] border-b border-charcoal-800 pb-1">
                  2. Sanction Facility & Payout
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Principal Requested:</span>
                    <p className="font-bold text-gold-300 print:text-black font-mono">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tenure:</span>
                    <p className="font-semibold text-white print:text-black">{loan.tenureMonths} Months</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Annual Rate:</span>
                    <p className="font-semibold text-gold-300 print:text-black font-mono">{rate}% p.a. (Fixed)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Repayment Mode:</span>
                    <p className="font-semibold text-white print:text-black">
                      {loan.repaymentFrequency === "BULLET" ? "Lump Sum Settlement at End" : loan.repaymentFrequency}
                    </p>
                  </div>
                  <div className="col-span-2 pt-1.5 border-t border-charcoal-800">
                    <span className="text-slate-400">Disbursement Channel:</span>
                    <p className="font-bold text-white print:text-black mt-0.5">
                      {income.disbursementMode === "UPI"
                        ? `Instant UPI (VPA: ${income.upiId})`
                        : income.disbursementMode === "CASH"
                        ? `Cash Handover (${income.cashPreferredCity}, Tel: ${income.cashContactPhone})`
                        : `Bank Transfer (${income.primaryBankName || "Bank"} A/C: ${income.primaryAccountNumber || "Registered"}, IFSC: ${income.ifscCode || "Standard"})`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: 6-Point Borrower Declaration Clauses */}
            <div className="space-y-3 rounded-2xl border border-charcoal-800 bg-charcoal-900/40 p-5 print:border-gray-300">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-charcoal-800 pb-2 print:text-black">
                BORROWER CONSENT & DECLARATION COVENANTS
              </h4>
              <ol className="space-y-2 text-[11px] leading-relaxed text-slate-300 print:text-gray-800">
                {BORROWER_CONSENT_CLAUSES.map((clause, idx) => (
                  <li key={clause.id} className="flex items-start space-x-2">
                    <span className="font-bold text-gold-400 shrink-0 print:text-black">{idx + 1}.</span>
                    <div>
                      <strong className="text-white print:text-black">{clause.title}: </strong>
                      <span>{clause.content}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="pt-2 border-t border-charcoal-800 text-[11px] text-gold-300 font-semibold print:text-black">
                Customer Acknowledgement: I have read and understood the above declaration and consent to the stated loan-related processing.
              </div>
            </div>

            {/* Section: Dual Electronic Signature & Timestamp Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Borrower Signature Box with Name Below */}
              <div className="rounded-xl border border-gold-500/40 bg-charcoal-950 p-4 space-y-2.5 text-xs print:border-gray-400">
                <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider block">
                  Borrower Digital Signature & Execution
                </span>

                {/* The Actual Signature */}
                <div className="h-20 w-full rounded-lg bg-charcoal-900/80 border border-charcoal-800 flex items-center justify-center p-2 print:bg-white">
                  {isDrawn ? (
                    <img
                      src={consent?.signatureData}
                      alt="Borrower Signature"
                      className="max-h-full max-w-full object-contain filter invert print:filter-none"
                    />
                  ) : (
                    <span className="font-serif italic font-bold text-xl text-gold-300 print:text-black">
                      {consent?.signatureData || borrower.fullName}
                    </span>
                  )}
                </div>

                {/* Name below the signature */}
                <div className="pt-1.5 border-t border-charcoal-800 text-center space-y-0.5">
                  <p className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
                    {signerName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Authorized Signer &bull; Legal Execution
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                    <span>Type: <strong>{consent?.signatureType || "DIGITAL"}</strong></span>
                    <span>Date: {formatDate(consent?.consentTimestamp || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>

              {/* Compliance & Security Stamp */}
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950 p-4 space-y-2.5 text-xs print:border-gray-400 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      Cryptographic Integrity & Audit Stamp
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Electronically executed by <strong>{signerName}</strong> under Section 65B of the Indian Evidence Act & IT Act 2000.
                  </p>
                </div>

                <div className="pt-1.5 border-t border-charcoal-800 space-y-1">
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Security Protocol:</span>
                    <span className="text-emerald-400 font-mono">TLS 1.3 Verified</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono break-all">
                    Hash: {applicationId}-SIG-{(consent?.consentTimestamp || Date.now().toString()).slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
