import * as React from "react";
import { IncomeDetails, DisbursementMode } from "@/lib/models/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  Landmark,
  DollarSign,
  Wallet,
  Smartphone,
  Banknote,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface StepIncomeProps {
  data: IncomeDetails;
  onChange: (data: Partial<IncomeDetails>) => void;
  onNext: () => void;
  onPrev: () => void;
  errors: Record<string, string>;
}

export function StepIncome({ data, onChange, onNext, onPrev, errors }: StepIncomeProps) {
  React.useEffect(() => {
    if (!data.occupationType) {
      onChange({ occupationType: "SALARIED" });
    }
    if (!data.disbursementMode) {
      onChange({ disbursementMode: "BANK_TRANSFER" });
    }
  }, []);

  const occOptions = [
    { value: "STUDENT", label: "Student / Scholar" },
    { value: "SALARIED", label: "Salaried Corporate / Government Executive" },
    { value: "SELF_EMPLOYED", label: "Self-Employed Professional" },
    { value: "BUSINESS_OWNER", label: "Business Owner / Enterprise Director" },
    { value: "CONSULTANT", label: "Consultant / Independent Contractor" },
  ];

  const selectedMode = data.disbursementMode || "BANK_TRANSFER";

  return (
    <div className="space-y-6">
      <div className="border-b border-charcoal-800 pb-4">
        <h2 className="text-xl font-serif font-bold text-white">
          Step 4: Income & Disbursement Preference
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specify your employment status and choose how you would like to receive the sanctioned loan amount.
        </p>
      </div>

      {/* Employment and Monthly Income */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select
          label="Employment / Income Source *"
          value={data.occupationType || "SALARIED"}
          onChange={(e) => onChange({ occupationType: e.target.value as any })}
          options={occOptions}
        />

        <Input
          label={
            data.occupationType === "STUDENT"
              ? "Monthly Allowance / Income (₹)"
              : "Net Monthly Verifiable Income (₹) *"
          }
          type="number"
          min={0}
          step={1000}
          placeholder={data.occupationType === "STUDENT" ? "0 if dependent on family" : "e.g. 80000"}
          value={data.monthlyIncome !== undefined ? data.monthlyIncome : ""}
          onChange={(e) => onChange({ monthlyIncome: Number(e.target.value) })}
          error={errors.monthlyIncome}
          prefixIcon={<Wallet className="h-4 w-4" />}
          helperText={`Monthly Inflow: ${formatCurrency(data.monthlyIncome || 0)}`}
        />
      </div>

      {/* Existing Obligations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Existing Monthly Loan / EMI Obligations (₹)"
          type="number"
          min={0}
          step={500}
          placeholder="0 if no current loans"
          value={data.existingLoanObligationsMonthly !== undefined ? data.existingLoanObligationsMonthly : ""}
          onChange={(e) => onChange({ existingLoanObligationsMonthly: Number(e.target.value) })}
          error={errors.existingLoanObligationsMonthly}
          prefixIcon={<DollarSign className="h-4 w-4" />}
          helperText={`Monthly Outflow: ${formatCurrency(data.existingLoanObligationsMonthly || 0)}`}
        />
      </div>

      {/* Disbursement Mode Selector */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          How would you like to receive the funds? (Disbursement Mode) *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Option 1: Bank Transfer */}
          <div
            onClick={() => onChange({ disbursementMode: "BANK_TRANSFER" })}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              selectedMode === "BANK_TRANSFER"
                ? "border-gold-500 bg-gold-500/10 shadow-gold-sm"
                : "border-charcoal-800 bg-charcoal-950/70 hover:border-charcoal-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`rounded-xl p-2 ${
                    selectedMode === "BANK_TRANSFER"
                      ? "bg-gold-500 text-charcoal-950"
                      : "bg-charcoal-800 text-slate-400"
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bank Transfer</h4>
                  <p className="text-[10px] text-slate-400">Direct NEFT / IMPS</p>
                </div>
              </div>
              {selectedMode === "BANK_TRANSFER" && (
                <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
              )}
            </div>
          </div>

          {/* Option 2: UPI */}
          <div
            onClick={() => onChange({ disbursementMode: "UPI" })}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              selectedMode === "UPI"
                ? "border-gold-500 bg-gold-500/10 shadow-gold-sm"
                : "border-charcoal-800 bg-charcoal-950/70 hover:border-charcoal-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`rounded-xl p-2 ${
                    selectedMode === "UPI"
                      ? "bg-gold-500 text-charcoal-950"
                      : "bg-charcoal-800 text-slate-400"
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">UPI / QR</h4>
                  <p className="text-[10px] text-slate-400">Instant UPI Transfer</p>
                </div>
              </div>
              {selectedMode === "UPI" && (
                <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
              )}
            </div>
          </div>

          {/* Option 3: Cash */}
          <div
            onClick={() => onChange({ disbursementMode: "CASH" })}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              selectedMode === "CASH"
                ? "border-gold-500 bg-gold-500/10 shadow-gold-sm"
                : "border-charcoal-800 bg-charcoal-950/70 hover:border-charcoal-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`rounded-xl p-2 ${
                    selectedMode === "CASH"
                      ? "bg-gold-500 text-charcoal-950"
                      : "bg-charcoal-800 text-slate-400"
                  }`}
                >
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cash Payout</h4>
                  <p className="text-[10px] text-slate-400">Direct Cash Handover</p>
                </div>
              </div>
              {selectedMode === "CASH" && (
                <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Fields based on Disbursement Mode */}
      {selectedMode === "BANK_TRANSFER" && (
        <div className="space-y-4 rounded-2xl border border-charcoal-800 bg-charcoal-950/60 p-5 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-xs font-bold text-gold-400 uppercase tracking-widest">
            <Landmark className="h-4 w-4" />
            <span>Bank Account Details for Disbursement</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Primary Bank Name *"
              placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
              value={data.primaryBankName || ""}
              onChange={(e) => onChange({ primaryBankName: e.target.value })}
              error={errors.primaryBankName}
              prefixIcon={<Landmark className="h-4 w-4" />}
              required
            />

            <Input
              label="Bank Branch IFSC Code *"
              placeholder="e.g. HDFC0000123"
              value={data.ifscCode || ""}
              onChange={(e) => onChange({ ifscCode: e.target.value.toUpperCase() })}
              error={errors.ifscCode}
              required
            />
          </div>

          <Input
            label="Disbursement Bank Account Number *"
            placeholder="Enter 9 to 18 digit account number"
            value={data.primaryAccountNumber || ""}
            onChange={(e) => onChange({ primaryAccountNumber: e.target.value })}
            error={errors.primaryAccountNumber}
            required
          />
        </div>
      )}

      {selectedMode === "UPI" && (
        <div className="space-y-4 rounded-2xl border border-charcoal-800 bg-charcoal-950/60 p-5 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-xs font-bold text-gold-400 uppercase tracking-widest">
            <Smartphone className="h-4 w-4" />
            <span>UPI Disbursement Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Virtual Payment Address (UPI ID) *"
              placeholder="e.g. yourname@upi or 9876543210@upi"
              value={data.upiId || ""}
              onChange={(e) => onChange({ upiId: e.target.value })}
              error={errors.upiId}
              prefixIcon={<Smartphone className="h-4 w-4" />}
              helperText="Sanctioned amount will be credited directly to this UPI address."
              required
            />

            <Input
              label="Linked Mobile Number *"
              placeholder="+91 98765 43210"
              value={data.cashContactPhone || ""}
              onChange={(e) => onChange({ cashContactPhone: e.target.value })}
              error={errors.cashContactPhone}
              helperText="For instant SMS transaction reference & confirmation"
              required
            />
          </div>
        </div>
      )}

      {selectedMode === "CASH" && (
        <div className="space-y-4 rounded-2xl border border-charcoal-800 bg-charcoal-950/60 p-5 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-xs font-bold text-gold-400 uppercase tracking-widest">
            <Banknote className="h-4 w-4" />
            <span>Direct Cash Disbursement Setup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Preferred City / Area for Cash Handover *"
              placeholder="e.g. Bengaluru, Hubli, Mysuru, etc."
              value={data.cashPreferredCity || ""}
              onChange={(e) => onChange({ cashPreferredCity: e.target.value })}
              error={errors.cashPreferredCity}
              required
            />

            <Input
              label="Direct Contact Phone for Handover Verification *"
              placeholder="+91 98765 43210"
              value={data.cashContactPhone || ""}
              onChange={(e) => onChange({ cashContactPhone: e.target.value })}
              error={errors.cashContactPhone}
              required
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Our officer will coordinate directly via the contact desk for identity verification and cash handover.
          </p>
        </div>
      )}

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
          <span>Continue to Guarantor Details</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
