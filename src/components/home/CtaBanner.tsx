import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-20 bg-charcoal-900 relative border-t border-gold-500/20 overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute inset-0 bg-radial-gold opacity-50 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/40 bg-charcoal-950 px-4 py-1.5 shadow-gold-sm">
          <ShieldCheck className="h-4 w-4 text-gold-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            Secure Digital Execution
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
          Ready to Secure Your Financing?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Begin your application now. Complete your details, upload required documentation, and receive dedicated underwriting review within 24 to 48 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/apply" className="w-full sm:w-auto">
            <Button variant="luxury" size="lg" className="w-full sm:w-auto text-sm uppercase tracking-wider font-bold shadow-gold-lg">
              <span>Start Loan Application</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/status" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm uppercase tracking-wider">
              Track Existing Application
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
