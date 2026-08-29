import * as React from "react";
import { KycDetails } from "@/lib/models/types";
import { KYC_DOC_TYPES } from "@/config/loans";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, ShieldCheck, Lock, CreditCard } from "lucide-react";

interface StepKycProps {
  data: KycDetails;
  onChange: (data: Partial<KycDetails>) => void;
  onNext: () => void;
  onPrev: () => void;
  errors: Record<string, string>;
}

export function StepKyc({ data, onChange, onNext, onPrev, errors }: StepKycProps) {
  React.useEffect(() => {
    if (!data.documentType) {
      onChange({ documentType: "AADHAAR" });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-charcoal-800 pb-4">
        <h2 className="text-xl font-serif font-bold text-white">
          Step 3: Government Identity & KYC Verification
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Identity disclosures are verified directly against authorized repositories under strict confidentiality protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select
          label="Primary Government Photo ID *"
          value={data.documentType || "AADHAAR"}
          onChange={(e) => onChange({ documentType: e.target.value as any })}
          options={KYC_DOC_TYPES}
        />

        <Input
          label={`${data.documentType === "AADHAAR" ? "12-Digit Aadhaar Number" : "Selected ID Number"} *`}
          placeholder={
            data.documentType === "AADHAAR"
              ? "5421 8902 3412"
              : "Enter document identification number"
          }
          value={data.documentNumber || ""}
          onChange={(e) => onChange({ documentNumber: e.target.value })}
          error={errors.documentNumber}
          prefixIcon={<CreditCard className="h-4 w-4" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Permanent Account Number (PAN) *"
          placeholder="ABCDE1234F"
          value={data.panNumber || ""}
          onChange={(e) => onChange({ panNumber: e.target.value.toUpperCase() })}
          error={errors.panNumber}
          prefixIcon={<CreditCard className="h-4 w-4" />}
          helperText="Mandatory for financial credit appraisal and tax reporting."
          required
        />
      </div>

      {/* Security Banner */}
      <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950/70 p-4 flex items-start space-x-3.5">
        <div className="rounded-lg bg-charcoal-800 p-2 text-gold-400 shrink-0 mt-0.5">
          <Lock className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Bank-Grade Data Masking & Encryption
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your identity numbers are stored with asymmetric cryptographic hashing. Aadhaar and PAN numbers are masked in administrative views to safeguard against unauthorized exposure.
          </p>
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
          className="text-xs uppercase tracking-wider font-bold"
        >
          <span>Continue to Income & Banking</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
