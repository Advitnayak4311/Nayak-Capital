import * as React from "react";
import { ShieldCheck, Eye, Zap, Lock, Scale, Users } from "lucide-react";

export function WhyNayak() {
  const pillars = [
    {
      title: "Absolute Transparency",
      description:
        "Every interest rate, schedule formula, processing cost, and repayment milestone is laid out with complete contractual clarity.",
      icon: Eye,
    },
    {
      title: "Strict Data Confidentiality",
      description:
        "Sensitive Aadhaar, identity, and income records are encrypted and protected behind authenticated streaming boundaries.",
      icon: Lock,
    },
    {
      title: "Swift Underwriting",
      description:
        "Our digital verification process eliminates bureaucratic delays, providing credit decisions within 24 to 48 business hours.",
      icon: Zap,
    },
    {
      title: "Institutional Standards",
      description:
        "Built on fair lending practices, structured covenants, and clear legal agreements rather than ambiguous terms.",
      icon: Scale,
    },
    {
      title: "Encrypted Document Vault",
      description:
        "Your loan agreements and submitted proofs are safely archived with digital audit trails and instant retrieval access.",
      icon: ShieldCheck,
    },
    {
      title: "Dedicated Loan Desk",
      description:
        "Direct access to loan officers who understand your unique liquidity requirements and repayment schedules.",
      icon: Users,
    },
  ];

  return (
    <section className="py-20 bg-charcoal-900/40 relative border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Why Nayak Capital
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Institutional Lending with Unwavering Trust
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            We combine rigorous financial discipline with modern digital efficiency to deliver financing you can rely upon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-charcoal-750 bg-charcoal-900/70 p-6 sm:p-7 space-y-3 hover:border-gold-500/30 transition-all shadow-md"
              >
                <div className="rounded-lg bg-charcoal-800 w-11 h-11 flex items-center justify-center border border-gold-500/20">
                  <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <h3 className="text-base font-bold text-white font-serif">{pillar.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
