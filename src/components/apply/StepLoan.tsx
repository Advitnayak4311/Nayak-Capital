import * as React from "react";
import { LoanRequestedDetails } from "@/lib/models/types";
import { LOAN_PRODUCTS, REPAYMENT_FREQUENCIES, getAnnualInterestRate } from "@/config/loans";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency, calculateEMI } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Calculator, UserCheck, Sparkles } from "lucide-react";

interface StepLoanProps {
  data: LoanRequestedDetails;
  onChange: (data: Partial<LoanRequestedDetails>) => void;
  onNext: () => void;
  onPrev: () => void;
  errors: Record<string, string>;
}

export function StepLoan({ data, onChange, onNext, onPrev, errors }: StepLoanProps) {
  const selectedProduct = LOAN_PRODUCTS[0];

  const currentTenure = data.tenureMonths || 5;
  const currentRate = getAnnualInterestRate(currentTenure);

  React.useEffect(() => {
    if (!data.productId) {
      onChange({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        proposedInterestRateAnnual: currentRate,
        proposedProcessingFeePercent: selectedProduct.processingFeePercent,
        calculationMethod: "REDUCING_BALANCE",
      });
    }
  }, []);

  const handleTenureChange = (months: number) => {
    const rate = getAnnualInterestRate(months);
    onChange({
      tenureMonths: months,
      proposedInterestRateAnnual: rate,
    });
  };

  // Live EMI computation
  const { emi, totalInterest, totalPayable } = React.useMemo(() => {
    const p = data.amount || 100000;
    const r = data.proposedInterestRateAnnual || currentRate;
    const t = currentTenure;
    return calculateEMI(p, r, t);
  }, [data.amount, data.proposedInterestRateAnnual, currentRate, currentTenure]);

  return (
    <div className="space-y-6">
      <div className="border-b border-charcoal-800 pb-4">
        <h2 className="text-xl font-serif font-bold text-white">
          Step 2: Facility Parameters & Loan Requirements
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specify your requested amount and preferred repayment tenure.
        </p>
      </div>

      {/* Product Highlight Banner */}
      <div className="rounded-2xl border border-gold-500/40 bg-charcoal-900/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-gold-sm">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-charcoal-800 p-2.5 border border-gold-500/20 text-gold-400 shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-serif">{selectedProduct.name}</h4>
            <p className="text-xs text-slate-400">
              Tenure &le; 3 Mo @ 13.5% p.a. &bull; 4 to 5 Mo @ 14.7% p.a. &bull; Max 5 Months
            </p>
          </div>
        </div>
        <div className="sm:text-right shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Applied Interest Rate</span>
          <span className="text-sm font-bold font-mono text-gold-300">
            {currentRate}% p.a.
          </span>
          <span className="text-[9px] text-slate-400 block">
            {currentTenure <= 3 ? "Standard Rate (≤ 3 Mo)" : "Rate for 4-5 Mo (Max 5 Mo)"}
          </span>
        </div>
      </div>

      {/* Amount & Tenure Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Requested Principal Amount *"
          type="number"
          min={1000}
          step={5000}
          value={data.amount || ""}
          onChange={(e) => onChange({ amount: Number(e.target.value) })}
          error={errors.amount}
          helperText={`In Words: ${formatCurrency(data.amount)}`}
          required
        />

        <Input
          label="Requested Tenure in Months (Max 5 Months) *"
          type="number"
          min={1}
          max={5}
          value={data.tenureMonths !== undefined ? data.tenureMonths : 3}
          onChange={(e) => {
            const val = Number(e.target.value);
            const clamped = Math.min(5, Math.max(1, val || 1));
            handleTenureChange(clamped);
          }}
          error={errors.tenureMonths}
          helperText={
            currentTenure <= 3
              ? `Duration: ${currentTenure} Month${currentTenure > 1 ? "s" : ""} (Standard Rate: 13.5% p.a.)`
              : `Duration: ${currentTenure} Months (Rate: 14.7% p.a. — Maximum 5 Months allowed)`
          }
          required
        />
      </div>

      {/* Repayment Frequency & Proposed Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select
          label="Preferred Repayment Frequency *"
          value={data.repaymentFrequency || "MONTHLY"}
          onChange={(e) => onChange({ repaymentFrequency: e.target.value as any })}
          options={REPAYMENT_FREQUENCIES}
        />

        <Input
          label="Proposed Disbursement Date *"
          type="date"
          value={data.proposedDisbursementDate || ""}
          onChange={(e) => onChange({ proposedDisbursementDate: e.target.value })}
          error={errors.proposedDisbursementDate}
          required
        />
      </div>

      {/* Purpose */}
      <Textarea
        label="Specific Purpose of Loan *"
        placeholder="Please detail how the loan proceeds will be utilized (e.g., Medical expenses, Education, Home renovation, Personal financing)..."
        value={data.purpose || ""}
        onChange={(e) => onChange({ purpose: e.target.value })}
        error={errors.purpose}
        rows={3}
        required
      />

      {/* Live Financial Computation Preview Box */}
      <div className="rounded-2xl border border-gold-500/30 bg-charcoal-950/80 p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gold-400">
          <Calculator className="h-4 w-4" />
          <span>Indicative Personal Loan Schedule Estimation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Principal:</span>
            <p className="text-sm font-bold text-white font-mono mt-0.5">{formatCurrency(data.amount)}</p>
          </div>
          <div>
            <span className="text-slate-400">Tenure:</span>
            <p className="text-sm font-bold text-white mt-0.5">{currentTenure} Months</p>
          </div>
          <div>
            <span className="text-slate-400">Interest Rate:</span>
            <p className="text-sm font-bold text-gold-300 font-mono mt-0.5">
              {currentRate}% p.a.
            </p>
          </div>
          <div>
            <span className="text-slate-400">Estimated EMI:</span>
            <p className="text-sm font-bold text-gold-300 font-mono mt-0.5">{formatCurrency(emi)}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-charcoal-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            Total Interest: <strong className="text-white font-mono">{formatCurrency(totalInterest)}</strong>
          </span>
          <span>
            Total Payable: <strong className="text-gold-300 font-mono">{formatCurrency(totalPayable)}</strong>
          </span>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-charcoal-800">
        <Button type="button" variant="outline" size="md" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back</span>
        </Button>
        <Button
          type="button"
          variant="luxury"
          size="lg"
          onClick={onNext}
          className="text-xs uppercase tracking-wider font-bold shadow-gold-md"
        >
          <span>Continue to KYC</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
