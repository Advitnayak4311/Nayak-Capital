import * as React from "react";
import Link from "next/link";
import { LOAN_PRODUCTS } from "@/config/loans";
import { Button } from "@/components/ui/Button";
import { LoanCalculator } from "@/components/home/LoanCalculator";
import { ArrowRight, CheckCircle2, Sparkles, FileText, UserCheck } from "lucide-react";

export const metadata = {
  title: "Personal Loan Services & Details",
  description:
    "Explore Nayak Capital's Personal Loan facilities with transparent interest rates (13.5% p.a. for up to 3 months, 14.7% p.a. for 4 to 5 months, max 5 months), structured terms, and prompt appraisal.",
};

export default function LoansPage() {
  const product = LOAN_PRODUCTS[0]; // Personal Loan

  return (
    <div className="py-12 md:py-20 space-y-20">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-4 py-1.5 shadow-gold-sm">
          <Sparkles className="h-3.5 w-3.5 text-gold-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            Personal Credit Facility
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          Personal Loan Facility
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Straightforward personal financing configured with tenure up to <strong className="text-white">3 months @ 13.5% p.a.</strong> (or <strong className="text-gold-300">14.7% p.a.</strong> for 4 to 5 months), flexible repayment schedules, and prompt verification. Maximum tenure is strictly 5 months.
        </p>
      </section>

      {/* Detailed Product Breakdown */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-charcoal-700 bg-charcoal-900/90 p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-charcoal-800 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-400 uppercase tracking-widest">
                <span>Personal Finance</span>
                <span>&bull;</span>
                <span>Structured Terms</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="rounded-2xl bg-charcoal-950 border border-gold-500/30 px-5 py-3 text-center sm:text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Fixed Rate Tiers</span>
                <p className="text-lg font-bold text-gold-300 font-mono">
                  13.5% / 14.7% <span className="text-xs text-slate-400">p.a.</span>
                </p>
                <span className="text-[10px] text-slate-500 block">&le;3 Mo: 13.5% &bull; 4-5 Mo: 14.7% (Max 5 Mo)</span>
              </div>
              <Link href="/apply">
                <Button variant="luxury" size="lg" className="text-xs uppercase tracking-wider font-bold shadow-gold-md">
                  <span>Apply for Personal Loan</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Eligibility & Documents Two-Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Eligibility */}
            <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950/40 p-6 space-y-4">
              <div className="flex items-center space-x-2 text-gold-400">
                <UserCheck className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  Eligibility Guidelines
                </h3>
              </div>
              <ul className="space-y-2.5">
                {product.eligibility.map((el, i) => (
                  <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gold-400 shrink-0 mt-0.5" />
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Documentation */}
            <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950/40 p-6 space-y-4">
              <div className="flex items-center space-x-2 text-gold-400">
                <FileText className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  Required Documentation
                </h3>
              </div>
              <ul className="space-y-2.5">
                {product.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gold-400 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Repayment Calculator */}
      <LoanCalculator />
    </div>
  );
}
