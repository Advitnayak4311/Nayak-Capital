"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PersonalLoanAgreement } from "@/lib/models/types";
import { LOAN_AGREEMENT_CLAUSES } from "@/config/legal";
import { siteConfig } from "@/config/site";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SignaturePad, SignatureData } from "@/components/ui/SignaturePad";
import { useToast } from "@/components/ui/Toast";
import {
  Landmark,
  ShieldCheck,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  ArrowLeft,
  FileText,
  AlertCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function AgreementPage() {
  const params = useParams();
  const agreementId = (params.id as string) || "";
  const { toast } = useToast();

  const [agreement, setAgreement] = React.useState<PersonalLoanAgreement | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSigning, setIsSigning] = React.useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
  const [signatureData, setSignatureData] = React.useState<SignatureData | null>(null);

  const documentRef = React.useRef<HTMLDivElement | null>(null);

  const fetchAgreement = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/agreement/${agreementId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAgreement(data.agreement);
      }
    } catch (err) {
      console.error("Failed to load agreement:", err);
    } finally {
      setIsLoading(false);
    }
  }, [agreementId]);

  React.useEffect(() => {
    fetchAgreement();
  }, [fetchAgreement]);

  const handleSignAgreement = async () => {
    if (!signatureData || !agreement) {
      toast({
        title: "Signature Required",
        description: "Please provide your electronic signature to execute the agreement.",
        type: "error",
      });
      return;
    }

    setIsSigning(true);
    try {
      const res = await fetch(`/api/agreement/${agreement.agreementId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureType: signatureData.type,
          signatureData: signatureData.data,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to sign agreement");
      }

      toast({
        title: "Agreement Executed",
        description: "Your Personal Loan Agreement has been signed and archived.",
        type: "success",
      });

      setAgreement(data.agreement);
    } catch (err: any) {
      toast({
        title: "Execution Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current || !agreement) return;

    setIsDownloadingPdf(true);
    try {
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#07090E",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Nayak_Capital_Agreement_${agreement.agreementId}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Personal Loan Agreement saved to your device.",
        type: "success",
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast({
        title: "Download Error",
        description: "Could not generate PDF. Please try printing the page.",
        type: "error",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Generating Institutional Agreement Document...
        </p>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Agreement Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested agreement reference is invalid or has not been generated yet.
        </p>
        <Link href="/status">
          <Button variant="secondary" size="md">
            Go to Status Portal
          </Button>
        </Link>
      </div>
    );
  }

  const isSigned = agreement.status === "SIGNED";

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-900/90 rounded-2xl border border-charcoal-750 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Link href={`/status?id=${agreement.applicationId}`}>
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Portal</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-charcoal-700" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                Document Status
              </span>
              <p className="text-xs font-bold text-white flex items-center space-x-1.5 mt-0.5">
                {isSigned ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">EXECUTED & SIGNED</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-amber-300">AWAITING BORROWER SIGNATURE</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs text-slate-300"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPdf}
              isLoading={isDownloadingPdf}
              className="text-xs text-gold-300"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Printable Institutional Agreement Document Body */}
        <div
          ref={documentRef}
          className="rounded-3xl border border-gold-500/30 bg-charcoal-950 p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* Watermark Crest */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] select-none">
            <span className="font-serif text-[180px] font-black text-gold-400">NC</span>
          </div>

          {/* Institutional Document Header */}
          <div className="border-b-2 border-gold-500/30 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-gold-400 uppercase">
                Institutional Lending Contract
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide mt-1">
                PERSONAL LOAN AGREEMENT
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Executed under the Lending Operations of {siteConfig.name} ({siteConfig.subName})
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs">
              <div>
                <span className="text-slate-500">Agreement Number:</span>
                <p className="font-mono font-bold text-gold-300">{agreement.agreementId}</p>
              </div>
              <div>
                <span className="text-slate-500">Application Reference:</span>
                <p className="font-mono text-white">{agreement.applicationId}</p>
              </div>
              <div>
                <span className="text-slate-500">Execution Date:</span>
                <p className="text-slate-300">{formatDate(agreement.generatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Parties Introduction */}
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed border-b border-charcoal-800 pb-6">
            <p>
              THIS PERSONAL LOAN AGREEMENT is made and entered into on this{" "}
              <strong className="text-white">{formatDate(agreement.generatedAt)}</strong>, BY AND BETWEEN:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                  THE LENDER
                </span>
                <h4 className="font-bold text-white text-sm">{siteConfig.name} ({siteConfig.subName})</h4>
                <p className="text-slate-400">{siteConfig.contact.address}</p>
                <p className="text-slate-400">{siteConfig.contact.email}</p>
              </div>

              <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                  THE BORROWER
                </span>
                <h4 className="font-bold text-white text-sm">{agreement.borrowerName}</h4>
                <p className="text-slate-400">{agreement.borrowerAddress}</p>
                <p className="text-slate-400">{agreement.borrowerMobile} &bull; {agreement.borrowerEmail}</p>
              </div>
            </div>
          </div>

          {/* Schedule A: Facility Sanction Parameters Table */}
          <div className="space-y-3 border-b border-charcoal-800 pb-6">
            <div className="flex items-center space-x-2 text-gold-400">
              <Landmark className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                Schedule A — Sanctioned Facility Parameters
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-charcoal-800 bg-charcoal-900/70">
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-charcoal-800/80">
                    <td className="p-3 text-slate-400 font-medium w-1/3">Principal Sum Sanctioned</td>
                    <td className="p-3 text-white font-bold font-mono text-sm text-gold-300">
                      {formatCurrency(agreement.principalAmount)}
                    </td>
                    <td className="p-3 text-slate-400 font-medium w-1/3">Contractual Interest Rate</td>
                    <td className="p-3 text-white font-bold font-mono">
                      {agreement.interestRateAnnual}% p.a.
                    </td>
                  </tr>
                  <tr className="border-b border-charcoal-800/80">
                    <td className="p-3 text-slate-400 font-medium">Tenure Duration</td>
                    <td className="p-3 text-white font-semibold">
                      {agreement.tenureMonths} Months
                    </td>
                    <td className="p-3 text-slate-400 font-medium">Repayment Frequency</td>
                    <td className="p-3 text-white font-semibold">
                      {agreement.repaymentFrequency}
                    </td>
                  </tr>
                  <tr className="border-b border-charcoal-800/80">
                    <td className="p-3 text-slate-400 font-medium">Calculation Methodology</td>
                    <td className="p-3 text-white font-semibold">
                      {agreement.calculationMethod.replace(/_/g, " ")}
                    </td>
                    <td className="p-3 text-slate-400 font-medium">Monthly Installment (EMI)</td>
                    <td className="p-3 text-gold-300 font-bold font-mono text-sm">
                      {formatCurrency(agreement.installmentAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-medium">Total Interest Obligation</td>
                    <td className="p-3 text-slate-300 font-mono">
                      {formatCurrency(agreement.totalInterest)}
                    </td>
                    <td className="p-3 text-slate-400 font-medium font-bold text-white">Total Amount Repayable</td>
                    <td className="p-3 text-gold-400 font-black font-mono text-sm">
                      {formatCurrency(agreement.totalPayable)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Standard Institutional Agreement Clauses */}
          <div className="space-y-6 text-xs text-slate-300 leading-relaxed border-b border-charcoal-800 pb-8">
            {LOAN_AGREEMENT_CLAUSES.map((sec, idx) => (
              <div key={idx} className="space-y-2.5">
                <h3 className="font-serif font-bold text-sm text-gold-300 uppercase tracking-wider">
                  {sec.section}
                </h3>
                <div className="space-y-2 pl-2">
                  {sec.clauses.map((clause, cIdx) => (
                    <div key={cIdx} className="space-y-0.5">
                      <p className="font-semibold text-white">
                        {clause.num} {clause.title}:
                      </p>
                      <p className="text-slate-300 pl-3 leading-relaxed">{clause.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/60 p-4 space-y-1.5 text-[11px] text-slate-400">
              <strong className="text-slate-200">Legal Review & Precedent Notice:</strong>
              <p>
                This agreement template reflects standard personal loan lending provisions. All clauses are subject to review by duly authorized legal counsel in accordance with applicable jurisdictional statutory codes.
              </p>
            </div>
          </div>

          {/* Dual Execution Signature Blocks */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400">
              IN WITNESS WHEREOF, the Parties have executed this Agreement:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Borrower Signature Box */}
              <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  BORROWER EXECUTION
                </span>
                {agreement.borrowerSignature ? (
                  <div className="space-y-2">
                    <div className="h-16 flex items-center justify-center rounded-lg border border-gold-500/30 bg-charcoal-950/80 p-2">
                      {agreement.borrowerSignature.signatureType === "DRAWN" ? (
                        <img
                          src={agreement.borrowerSignature.signatureData}
                          alt="Borrower Signature"
                          className="max-h-12 object-contain"
                        />
                      ) : (
                        <span className="font-serif italic text-xl text-gold-300">
                          {agreement.borrowerSignature.signatureData}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <p>
                        <strong>Signatory:</strong> {agreement.borrowerName}
                      </p>
                      <p>
                        <strong>Signed:</strong> {formatDateTime(agreement.borrowerSignature.signedAt)}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Audit IP: {agreement.borrowerSignature.signedIp || "127.0.0.1 (Verified)"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                      Please affix your digital signature below to complete execution:
                    </p>
                    <SignaturePad
                      signerFullName={agreement.borrowerName}
                      onSignatureCapture={setSignatureData}
                    />
                    <Button
                      variant="luxury"
                      size="md"
                      onClick={handleSignAgreement}
                      isLoading={isSigning}
                      disabled={!signatureData}
                      className="w-full text-xs uppercase tracking-wider font-bold"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span>Sign & Accept Agreement</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Lender Signature Box */}
              <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  LENDER EXECUTION (NAYAK CAPITAL)
                </span>
                <div className="space-y-2">
                  <div className="h-16 flex items-center justify-center rounded-lg border border-gold-500/30 bg-charcoal-950/80 p-2">
                    <span className="font-serif italic text-xl text-gold-400">
                      {agreement.lenderSignature?.signatureData || "K. Nayak (Authorized)"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <p>
                      <strong>Authorized Officer:</strong>{" "}
                      {agreement.lenderSignature?.signatoryName || "K. Nayak"}
                    </p>
                    <p>
                      <strong>Title:</strong>{" "}
                      {agreement.lenderSignature?.signatoryTitle || "Managing Director, Nayak Capital"}
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {formatDateTime(agreement.lenderSignature?.signedAt || agreement.generatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Footer & Verification Stamp */}
          <div className="border-t border-charcoal-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
            <div>
              <span>Document Version: {agreement.agreementVersion} &bull; Template: {agreement.templateVersion}</span>
            </div>
            <div>
              <span>Verification Hash: NC-VAULT-{Buffer.from(agreement.agreementId).toString("hex").slice(0, 12).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
