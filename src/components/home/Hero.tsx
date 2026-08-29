import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      {/* Background Radiance & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-radial-gold pointer-events-none opacity-60" />
      <div className="absolute -top-32 right-10 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-20 w-80 h-80 rounded-full bg-gold-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        {/* Top Brand Pill */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900/90 px-4 py-1.5 shadow-gold-sm">
          <Sparkles className="h-3.5 w-3.5 text-gold-400" />
          <span className="text-xs font-semibold tracking-widest uppercase text-gold-300">
            Personal Lending & Structured Credit
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
          TRUSTED LOANS. <br />
          <span className="text-gold-gradient">STRONGER FUTURES.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Nayak Capital delivers bespoke personal credit solutions with a fixed 13.5% annual interest rate (which may vary based on loan amount). Clear terms, prompt document review, and bank-grade data security.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/apply" className="w-full sm:w-auto">
            <Button variant="luxury" size="lg" className="w-full sm:w-auto text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-gold-md">
              <span>Apply for Personal Loan</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/loans" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm tracking-wider">
              View Loan Details
            </Button>
          </Link>
        </div>

        {/* Key Trust Highlights */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 border-t border-charcoal-800/80 max-w-2xl mx-auto text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
            <span className="font-medium">13.5% Fixed Rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
            <span className="font-medium">Clear & Direct Terms</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
            <span className="font-medium">Digital Agreement</span>
          </div>
        </div>
      </div>
    </section>
  );
}
