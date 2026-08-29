import * as React from "react";
import Link from "next/link";
import { LOAN_PRODUCTS } from "@/config/loans";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, UserCheck, Sparkles } from "lucide-react";

export function ProductCards() {
  const product = LOAN_PRODUCTS[0]; // Personal Loan

  return (
    <section className="py-20 bg-charcoal-950 relative border-t border-charcoal-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-3.5 py-1">
            <Sparkles className="h-3.5 w-3.5 text-gold-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-gold-400">
              Personal Lending Solution
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Personal Loan Facility
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Confidential, structured personal credit offering a fixed 13.5% annual interest rate (which may vary based on loan amount).
          </p>
        </div>

        {/* Focused Product Card Presentation */}
        <div className="max-w-3xl mx-auto">
          <Card variant="luxury" className="ring-1 ring-gold-500/40 relative shadow-card-luxury">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 text-charcoal-950 px-4 py-0.5 text-[10px] font-bold tracking-widest uppercase shadow-gold-sm">
              Featured Personal Credit
            </div>

            <CardHeader className="space-y-4 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-xl bg-charcoal-800 p-3 border border-gold-500/20">
                    <UserCheck className="h-6 w-6 text-gold-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white font-serif">{product.name}</CardTitle>
                    <CardDescription className="mt-0.5">{product.tagline}</CardDescription>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Interest Rate
                  </span>
                  <span className="text-lg font-bold font-mono text-gold-300">
                    13.5% p.a. Fixed
                  </span>
                  <span className="text-[10px] text-slate-500 block">May vary based on amount</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Financial Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-4">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Loan Range</span>
                  <p className="text-base font-bold text-white mt-1">₹25,000 – ₹25.00 Lakh</p>
                </div>
                <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-4">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Tenure Range</span>
                  <p className="text-base font-bold text-white mt-1">6 to 60 Months</p>
                </div>
                <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-4">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Repayment Plan</span>
                  <p className="text-base font-bold text-gold-300 mt-1">Monthly EMI</p>
                </div>
              </div>

              {/* Feature Highlights Grid */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Key Facility Features
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Checklist */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Eligibility Criteria
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.eligibility.map((el, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{el}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-6 border-t border-charcoal-800/80">
              <Link href="/apply" className="w-full">
                <Button
                  variant="luxury"
                  size="lg"
                  className="w-full text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-gold-md"
                >
                  <span>Apply for Personal Loan</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
