import * as React from "react";
import { FileText, UploadCloud, ShieldCheck, FileCheck, PenTool, Landmark } from "lucide-react";

export function ProcessTimeline() {
  const steps = [
    {
      num: "01",
      title: "Digital Application",
      description:
        "Select your loan product and provide personal, financial, and employment information via our streamlined form.",
      icon: FileText,
    },
    {
      num: "02",
      title: "Document Upload",
      description:
        "Securely transmit KYC identity documents, income records, and photographs into our encrypted vault.",
      icon: UploadCloud,
    },
    {
      num: "03",
      title: "Appraisal & Verification",
      description:
        "Our underwriting officers verify identity proofs, evaluate debt service capacity, and structure sanction terms.",
      icon: ShieldCheck,
    },
    {
      num: "04",
      title: "Borrower Consent",
      description:
        "Review and digitally acknowledge the structured borrower declaration and data processing terms.",
      icon: FileCheck,
    },
    {
      num: "05",
      title: "Agreement Generation",
      description:
        "Our automated engine populates a formal Personal Loan Agreement detailing the repayment schedule and covenants.",
      icon: Landmark,
    },
    {
      num: "06",
      title: "Execution & Disbursement",
      description:
        "Affix your legal digital signature. Upon counter-signature by Nayak Capital, funds are disbursed to your verified bank.",
      icon: PenTool,
    },
  ];

  return (
    <section className="py-20 bg-charcoal-950 relative border-t border-charcoal-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Transparent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            How Nayak Capital Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A seamless six-stage institutional lending lifecycle engineered for security, clarity, and rapid execution.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-charcoal-700/80 bg-charcoal-900/80 p-6 sm:p-7 space-y-4 hover:border-gold-500/40 transition-all group shadow-lg"
              >
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-charcoal-800 p-3 border border-gold-500/20 group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-colors">
                    <Icon className="h-5 w-5 text-gold-400 group-hover:text-charcoal-950" />
                  </div>
                  <span className="font-mono text-2xl font-black text-charcoal-600 group-hover:text-gold-500/60 transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-serif tracking-wide group-hover:text-gold-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
