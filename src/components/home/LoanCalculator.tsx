"use client";

import * as React from "react";
import Link from "next/link";
import { formatCurrency, calculateEMI } from "@/lib/utils";
import { getAnnualInterestRate } from "@/config/loans";
import { Button } from "@/components/ui/Button";
import { Calculator, ArrowRight, Info, Sparkles } from "lucide-react";

export function LoanCalculator() {
  const [amount, setAmount] = React.useState<number>(100000);
  const [tenureMonths, setTenureMonths] = React.useState<number>(3);
  const [useCustomRate, setUseCustomRate] = React.useState<boolean>(false);
  const [customRate, setCustomRate] = React.useState<number>(13.5);

  const policyRate = getAnnualInterestRate(tenureMonths);
  const activeRate = useCustomRate ? customRate : policyRate;

  const { emi, totalInterest, totalPayable } = React.useMemo(() => {
    return calculateEMI(amount, activeRate, tenureMonths);
  }, [amount, activeRate, tenureMonths]);

  const principalRatio = totalPayable > 0 ? (amount / totalPayable) * 100 : 0;
  const interestRatio = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  const quickAmounts = [25000, 50000, 100000, 200000, 500000, 1000000];
  const quickTenures = [1, 2, 3, 4, 5];

  const handleTenureInput = (val: number) => {
    const clamped = Math.min(5, Math.max(1, val || 1));
    setTenureMonths(clamped);
  };

  return (
    <section className="py-20 bg-charcoal-900/60 relative border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-3.5 py-1 shadow-gold-sm">
            <Calculator className="h-3.5 w-3.5 text-gold-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-gold-400">
              Personal Loan Estimator
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Estimate Your Personal Loan EMI
          </h2>
          <p className="text-sm text-slate-400">
            Tenure up to <strong className="text-white">3 months @ 13.5% p.a.</strong> Above 3 months until 5 months is <strong className="text-gold-300">14.7% p.a.</strong> (Maximum tenure is strictly 5 months).
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6 rounded-2xl border border-charcoal-750 bg-charcoal-900/95 p-6 sm:p-8 shadow-xl">
              {/* Custom Loan Amount Input & Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Loan Principal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gold-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={10000}
                      max={2500000}
                      step={5000}
                      value={amount || ""}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-36 rounded-lg border border-charcoal-700 bg-charcoal-950 pl-6 pr-2.5 py-1.5 text-right text-sm font-bold text-gold-300 font-mono focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={10000}
                  max={2500000}
                  step={10000}
                  value={Math.min(amount, 2500000)}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-charcoal-750 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                        amount === amt
                          ? "bg-gold-500 text-charcoal-950 font-bold"
                          : "bg-charcoal-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      ₹{(amt / 100000 >= 1 ? `${amt / 100000}L` : `${amt / 1000}k`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tenure Input & Slider (Max 5 Months) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                      Tenure Duration (Max 5 Months)
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {tenureMonths <= 3 ? "Standard tenure: 13.5% p.a. (≤ 3 Mo)" : "4 to 5 Months: 14.7% p.a. (Max 5 Mo)"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={tenureMonths || ""}
                      onChange={(e) => handleTenureInput(Number(e.target.value))}
                      className="w-20 rounded-lg border border-charcoal-700 bg-charcoal-950 px-2.5 py-1.5 text-center text-sm font-bold text-gold-300 font-mono focus:border-gold-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">Mo</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={Math.min(Math.max(tenureMonths, 1), 5)}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full h-2 bg-charcoal-750 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />

                {/* Quick preset tenure chips (1 to 5 Months only) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickTenures.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                        tenureMonths === m
                          ? "bg-gold-500 text-charcoal-950 font-bold"
                          : "bg-charcoal-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m} Mo {m <= 3 ? "(13.5%)" : "(14.7%)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate Tier Banner */}
              <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/80 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-gold-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Applied Interest Rate
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-gold-300 font-mono">
                      {activeRate.toFixed(1)}% p.a.
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseCustomRate(!useCustomRate)}
                      className="text-[10px] text-gold-400 hover:text-gold-300 underline font-medium"
                    >
                      {useCustomRate ? "Auto Policy" : "Custom Rate"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className={`p-2 rounded-lg border text-center ${tenureMonths <= 3 ? "border-gold-500/50 bg-gold-500/10 text-gold-300 font-bold" : "border-charcoal-800 text-slate-400"}`}>
                    <span>&le; 3 Months: 13.5% p.a.</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${tenureMonths > 3 ? "border-gold-500/50 bg-gold-500/10 text-gold-300 font-bold" : "border-charcoal-800 text-slate-400"}`}>
                    <span>4 to 5 Months: 14.7% p.a.</span>
                  </div>
                </div>

                {useCustomRate && (
                  <div className="pt-2 border-t border-charcoal-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Manual Simulation Rate:</span>
                      <span className="font-mono text-gold-300 font-bold">{customRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min={8.0}
                      max={24.0}
                      step={0.1}
                      value={customRate}
                      onChange={(e) => setCustomRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-charcoal-750 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 text-xs text-slate-400 bg-charcoal-950/60 p-3 rounded-xl border border-charcoal-800">
                <Info className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                <span>
                  Flat interest calculation on full principal amount (e.g. ₹1,000 + 13.5% = ₹1,135). Maximum allowed tenure is strictly 5 months (up to 3 months @ 13.5%; 4 to 5 months @ 14.7%).
                </span>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-gold-500/30 bg-gradient-to-b from-charcoal-850 to-charcoal-950 p-6 sm:p-8 shadow-card-luxury space-y-6 text-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Estimated Monthly Installment (EMI)
                  </span>
                  <div className="text-3xl sm:text-4xl font-serif font-black text-gold-gradient mt-2">
                    {formatCurrency(emi)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Per Month for {tenureMonths} Month{tenureMonths > 1 ? "s" : ""} @ {activeRate}% p.a.
                  </span>
                </div>

                <div className="border-t border-charcoal-800 pt-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Principal Sum:</span>
                    <span className="font-semibold text-white font-mono">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Interest:</span>
                    <span className="font-semibold text-gold-300 font-mono">
                      {formatCurrency(totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-charcoal-800">
                    <span className="font-bold text-white">Total Amount Payable:</span>
                    <span className="font-bold text-gold-400 font-mono">
                      {formatCurrency(totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Breakdown Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="h-3 w-full rounded-full bg-charcoal-800 flex overflow-hidden">
                    <div
                      style={{ width: `${principalRatio}%` }}
                      className="bg-gold-500 h-full"
                      title="Principal"
                    />
                    <div
                      style={{ width: `${interestRatio}%` }}
                      className="bg-gold-800 h-full"
                      title="Interest"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-gold-500 mr-1" />
                      Principal ({principalRatio.toFixed(0)}%)
                    </span>
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-gold-800 mr-1" />
                      Interest ({interestRatio.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                <Link
                  href={`/apply?amount=${amount}&tenure=${tenureMonths}&rate=${activeRate}`}
                  className="block w-full"
                >
                  <Button variant="luxury" size="lg" className="w-full text-xs uppercase tracking-wider font-bold shadow-gold-md">
                    <span>Proceed with This Estimate</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
