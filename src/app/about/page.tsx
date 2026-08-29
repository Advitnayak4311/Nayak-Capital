import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Scale, Lock, Users, ArrowRight, Landmark } from "lucide-react";

export const metadata = {
  title: "About Us — Personal Lending & Financial Philosophy",
  description:
    "Learn about Nayak Capital's commitment to responsible credit, data privacy, transparent loan terms, and structured personal financing.",
};

export default function AboutPage() {
  const principles = [
    {
      title: "Responsible Underwriting",
      desc: "Every personal loan facility is structured after evaluating true repayment capacity, ensuring sustainable financial stability.",
      icon: Scale,
    },
    {
      title: "Contractual Clarity",
      desc: "We eliminate hidden charges, complex penalty clauses, and ambiguous schedules. All agreements feature transparent fixed rates (13.5% / 14.7% p.a.).",
      icon: Landmark,
    },
    {
      title: "Confidentiality & Privacy",
      desc: "Applicant identity records, financials, and KYC proofs are handled under 256-bit encryption protocols and strict access controls.",
      icon: Lock,
    },
    {
      title: "Direct Client Support",
      desc: "Direct access to loan officers who assist throughout the entire application, agreement execution, and repayment lifecycle.",
      icon: Users,
    },
  ];

  return (
    <div className="py-12 md:py-20 space-y-16">
      {/* Hero Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-4 py-1.5 shadow-gold-sm">
          <ShieldCheck className="h-4 w-4 text-gold-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            About Nayak Capital
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          Trusted Loans. <span className="text-gold-gradient">Stronger Futures.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Nayak Capital delivers personal credit solutions grounded in transparency, integrity, and borrower trust.
        </p>
      </section>

      {/* Mission & Vision Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="luxury" className="p-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Our Purpose</span>
            <h2 className="text-2xl font-serif font-bold text-white">Empowering Personal Financial Stability</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We provide dependable personal credit solutions that enable individuals to address essential needs and financial milestones without unexpected fees or hidden complexities.
            </p>
          </Card>

          <Card variant="default" className="p-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Our Standards</span>
            <h2 className="text-2xl font-serif font-bold text-white">Fair & Transparent Lending</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We operate under straightforward underwriting principles, fixed interest terms from 13.5% p.a. (max 5 months), clear data protection guidelines, and legally binding digital loan agreements.
            </p>
          </Card>
        </div>
      </section>

      {/* Core Principles */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Our Operational Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            The foundational commitments guiding our relationship with every borrower.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-charcoal-750 bg-charcoal-900/80 p-6 space-y-3 shadow-md"
              >
                <div className="rounded-lg bg-charcoal-800 w-10 h-10 flex items-center justify-center border border-gold-500/20">
                  <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-serif">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Action Notice */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold-500/30 bg-charcoal-900/90 p-8 text-center space-y-6 shadow-xl">
          <h3 className="text-xl font-serif font-bold text-white">
            Experience Transparent Personal Lending
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Our loan desk is ready to evaluate your financial requirements with prompt discretion and professional rigor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apply">
              <Button variant="luxury" size="lg" className="text-xs uppercase tracking-wider font-bold shadow-gold-md">
                <span>Start Personal Loan Application</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg" className="text-xs uppercase tracking-wider">
                Contact Loan Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
