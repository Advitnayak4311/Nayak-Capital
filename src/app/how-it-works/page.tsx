import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { FAQ } from "@/components/home/FAQ";
import { ArrowRight, ShieldCheck, CheckCircle2, Lock, FileCheck2 } from "lucide-react";

export const metadata = {
  title: "How It Works — Step-by-Step Lending Guide",
  description:
    "Understand the complete Nayak Capital loan process from online application and document verification to agreement signing and disbursement.",
};

export default function HowItWorksPage() {
  return (
    <div className="py-12 md:py-20 space-y-16">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-4 py-1.5 shadow-gold-sm">
          <ShieldCheck className="h-4 w-4 text-gold-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            Transparent Credit Process
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          The Lending Lifecycle, Simplified
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From initial digital submission to fund disbursement, discover how Nayak Capital ensures security, transparency, and speed at every stage.
        </p>
      </section>

      {/* Main Process Timeline Component */}
      <ProcessTimeline />

      {/* What to Expect During Review */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-charcoal-700 bg-charcoal-900/90 p-8 sm:p-12 space-y-8 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Institutional Underwriting
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              What Happens After You Submit?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-5 space-y-3">
              <div className="rounded-lg bg-charcoal-800 w-9 h-9 flex items-center justify-center text-gold-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif">1. Verification Check</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our operations team verifies your identity and address documents against official repositories.
              </p>
            </div>

            <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-5 space-y-3">
              <div className="rounded-lg bg-charcoal-800 w-9 h-9 flex items-center justify-center text-gold-400">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif">2. Credit Appraisal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We analyze your declared cash flows and debt obligations to structure a feasible monthly repayment plan.
              </p>
            </div>

            <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-5 space-y-3">
              <div className="rounded-lg bg-charcoal-800 w-9 h-9 flex items-center justify-center text-gold-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif">3. Agreement Execution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                An exact Personal Loan Agreement is populated for your digital signature prior to fund release.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link href="/apply">
              <Button variant="luxury" size="lg" className="text-xs uppercase tracking-wider font-bold">
                <span>Start Your Loan Application</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  );
}
