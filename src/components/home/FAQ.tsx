"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const faqs = [
    {
      q: "What types of loans does Nayak Capital provide?",
      a: "We specialize exclusively in Personal Loans for salaried and self-employed individuals with transparent terms, structured monthly installments, and a fixed 13.5% annual interest rate (which may vary based on loan amount).",
    },
    {
      q: "What is the interest rate on personal loans?",
      a: "Our standard interest rate is fixed at 13.5% per annum. The exact rate and terms are confirmed during appraisal and stated in your loan agreement, and may vary depending on the sanctioned loan amount and borrower profile.",
    },
    {
      q: "What documents are required to initiate an application?",
      a: "Standard requirements include a recent photograph, Government-issued photo identification (Aadhaar, PAN, Passport, or Voter ID), address proof, and recent bank statements or salary records.",
    },
    {
      q: "How does the digital Borrower Consent differ from the Loan Agreement?",
      a: "The Borrower Consent & Declaration is the preliminary authorization permitting Nayak Capital to verify your credentials and process your application. Once your loan is approved, a separate and legally binding Personal Loan Agreement is generated, detailing the exact repayment dates, interest calculation method, and terms.",
    },
    {
      q: "How quickly are applications evaluated and disbursed?",
      a: "Upon complete submission of your online application and verified documents, our credit appraisal typically completes within 24 to 48 business hours. Once the Personal Loan Agreement is digitally signed by both parties, funds are disbursed promptly to your bank account.",
    },
    {
      q: "Is my personal, identity, and financial information secure?",
      a: "Yes. Nayak Capital operates a secure data architecture with 256-bit encryption. Sensitive identity records (such as Aadhaar and PAN numbers) are strictly protected and documents are served via authenticated, private access protocols.",
    },
  ];

  return (
    <section className="py-20 bg-charcoal-950 relative border-t border-charcoal-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Clarity & Guidance
          </h2>
          <p className="text-sm text-slate-400">
            Common questions regarding our personal loan process, documentation, and agreements.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-charcoal-750 bg-charcoal-900/80 overflow-hidden transition-all shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-white hover:text-gold-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-gold-400 transition-transform duration-200 shrink-0 ml-4",
                      isOpen && "rotate-180 text-gold-300"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-charcoal-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
