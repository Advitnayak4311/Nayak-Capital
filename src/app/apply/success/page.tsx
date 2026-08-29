"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoanApplication } from "@/lib/models/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SignedDeclarationPdfModal } from "@/components/apply/SignedDeclarationPdfModal";
import {
  CheckCircle2,
  Copy,
  Search,
  Printer,
  Download,
  Clock,
  Home,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ApplySuccessPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id") || "NC-APP-2026-XXXX";
  const { toast } = useToast();
  const [appData, setAppData] = React.useState<LoanApplication | null>(null);
  const [showPdfModal, setShowPdfModal] = React.useState(false);

  React.useEffect(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#F3EAC6", "#C5A059", "#FFFFFF"],
      });
    } catch {
      // ignore
    }

    if (applicationId && applicationId !== "NC-APP-2026-XXXX") {
      fetch(`/api/applications/${applicationId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.application) {
            setAppData(data.application);
          }
        })
        .catch((err) => console.error("Could not load application:", err));
    }
  }, [applicationId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(applicationId);
    toast({
      title: "Reference Copied",
      description: "Application Reference copied to your clipboard.",
      type: "success",
    });
  };

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Success Icon Crest */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 shadow-gold-sm">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Application Transmitted Successfully
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Thank You for Applying
          </h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Your credit application and digital borrower declaration have been securely registered and assigned to our underwriting committee.
          </p>
        </div>

        {/* Application Reference ID Box */}
        <div className="rounded-2xl border border-gold-500/40 bg-gradient-to-b from-charcoal-850 to-charcoal-950 p-6 shadow-card-luxury space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Your Unique Application Reference
          </span>
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-gold-gradient tracking-wider">
              {applicationId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-lg bg-charcoal-800 text-slate-300 hover:text-gold-300 hover:bg-charcoal-700 transition-colors"
              title="Copy Application ID"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Please retain this reference code for real-time status tracking and communications with your loan officer.
          </p>
        </div>

        {/* Instant PDF Document Banner */}
        {appData && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30 shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Download Signed Declaration PDF
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Your signed document with full covenants, late payment clauses, and digital signature.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="luxury"
              size="md"
              onClick={() => setShowPdfModal(true)}
              className="text-xs font-bold uppercase tracking-wider shrink-0 shadow-gold-sm"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Download Signed PDF</span>
            </Button>
          </div>
        )}

        {/* What Happens Next Card */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/80 p-6 text-left space-y-4 text-xs text-slate-300">
          <h3 className="font-bold text-sm text-white font-serif uppercase tracking-wider flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gold-400" />
            <span>Next Steps in the Appraisal Process</span>
          </h3>

          <ul className="space-y-3 pl-1">
            <li className="flex items-start space-x-2.5">
              <span className="h-5 w-5 rounded-full bg-charcoal-800 text-gold-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>Document Verification:</strong> Our underwriting officers will review your identity and submitted preferences within 24 to 48 business hours.
              </span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="h-5 w-5 rounded-full bg-charcoal-800 text-gold-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong>Sanction Notice:</strong> You will receive confirmation via email and SMS regarding your credit decision and approved facility parameters.
              </span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="h-5 w-5 rounded-full bg-charcoal-800 text-gold-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong>Personal Loan Agreement:</strong> Upon sanction, an exact digital agreement will be made available for your electronic signature prior to disbursement.
              </span>
            </li>
          </ul>

          <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3 text-[11px] text-slate-400 italic">
            * Important: Submission of an application does not constitute guaranteed sanction. Credit approval is contingent upon formal underwriting evaluation.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href={`/status?id=${applicationId}`} className="w-full sm:w-auto">
            <Button variant="luxury" size="lg" className="w-full sm:w-auto text-xs uppercase tracking-wider font-bold shadow-gold-md">
              <Search className="h-4 w-4 mr-2" />
              <span>Track Application Status</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs uppercase tracking-wider">
              <Home className="h-4 w-4 mr-2" />
              <span>Return to Home</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* PDF Document Modal */}
      {appData && (
        <SignedDeclarationPdfModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          applicationId={appData.applicationId}
          borrower={appData.borrower}
          loan={appData.loan}
          kyc={appData.kyc}
          income={appData.income}
          consent={appData.consent}
        />
      )}
    </div>
  );
}
