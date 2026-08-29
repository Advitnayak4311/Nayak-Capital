import * as React from "react";
import { GuarantorDetails } from "@/lib/models/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, Users, ShieldCheck } from "lucide-react";

interface StepGuarantorProps {
  data: GuarantorDetails;
  onChange: (data: Partial<GuarantorDetails>) => void;
  onNext: () => void;
  onPrev: () => void;
  errors: Record<string, string>;
}

export function StepGuarantor({ data, onChange, onNext, onPrev, errors }: StepGuarantorProps) {
  const hasGuarantor = data.hasGuarantor || false;

  return (
    <div className="space-y-6">
      <div className="border-b border-charcoal-800 pb-4">
        <h2 className="text-xl font-serif font-bold text-white">
          Step 5: Guarantor / Co-Applicant (Optional)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          A guarantor or co-signer is optional for prime facilities, but may enhance credit appraisal for larger facility sizes.
        </p>
      </div>

      {/* Guarantor Toggle Card */}
      <div
        onClick={() => onChange({ hasGuarantor: !hasGuarantor })}
        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
          hasGuarantor
            ? "border-gold-500 bg-charcoal-850 shadow-gold-sm"
            : "border-charcoal-700 bg-charcoal-900 hover:border-charcoal-600"
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`p-2.5 rounded-xl border ${
              hasGuarantor
                ? "bg-gold-500 text-charcoal-950 border-gold-400"
                : "bg-charcoal-800 text-slate-400 border-charcoal-700"
            }`}
          >
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Include a Guarantor / Co-Applicant</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Enable this toggle if you wish to provide a legal guarantor for this facility.
            </p>
          </div>
        </div>
        <div
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
            hasGuarantor ? "bg-gold-500" : "bg-charcoal-700"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              hasGuarantor ? "translate-x-5 bg-charcoal-950" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {/* Guarantor Form Fields */}
      {hasGuarantor && (
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/80 p-6 space-y-5 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Guarantor Full Legal Name *"
              placeholder="e.g. Anita Sharma"
              value={data.fullName || ""}
              onChange={(e) => onChange({ fullName: e.target.value })}
              error={errors["guarantor.fullName"]}
              required
            />

            <Input
              label="Relationship to Borrower *"
              placeholder="e.g. Spouse / Brother / Business Partner"
              value={data.relationship || ""}
              onChange={(e) => onChange({ relationship: e.target.value })}
              error={errors["guarantor.relationship"]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Guarantor Mobile Number *"
              placeholder="+91 98000 00000"
              value={data.mobile || ""}
              onChange={(e) => onChange({ mobile: e.target.value })}
              error={errors["guarantor.mobile"]}
              required
            />

            <Input
              label="Guarantor Email Address"
              type="email"
              placeholder="guarantor@domain.com"
              value={data.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Guarantor Occupation / Business"
              placeholder="e.g. Chartered Accountant / Enterprise Owner"
              value={data.occupation || ""}
              onChange={(e) => onChange({ occupation: e.target.value })}
            />

            <Textarea
              label="Guarantor Residential Address"
              placeholder="Residential address of guarantor..."
              value={data.address || ""}
              onChange={(e) => onChange({ address: e.target.value })}
              rows={2}
            />
          </div>
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
          className="text-xs uppercase tracking-wider font-bold"
        >
          <span>Continue to Document Uploads</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
