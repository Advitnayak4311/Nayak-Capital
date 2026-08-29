import * as React from "react";
import { BorrowerDetails } from "@/lib/models/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ArrowRight, User, Mail, Phone, Calendar, Briefcase } from "lucide-react";

interface StepBorrowerProps {
  data: BorrowerDetails;
  onChange: (data: Partial<BorrowerDetails>) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

export function StepBorrower({ data, onChange, onNext, errors }: StepBorrowerProps) {
  const [sameAddress, setSameAddress] = React.useState(true);

  const handleCurrentAddressChange = (val: string) => {
    if (sameAddress) {
      onChange({ currentAddress: val, permanentAddress: val });
    } else {
      onChange({ currentAddress: val });
    }
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      onChange({ permanentAddress: data.currentAddress || "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-charcoal-800 pb-4">
        <h2 className="text-xl font-serif font-bold text-white">
          Step 1: Borrower Personal & Contact Information
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Please enter your details exactly as they appear on your Government-issued identification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Full Legal Name *"
          placeholder="e.g. Vikramaditya Sharma"
          value={data.fullName || ""}
          onChange={(e) => onChange({ fullName: e.target.value })}
          error={errors.fullName}
          prefixIcon={<User className="h-4 w-4" />}
          required
        />

        <Input
          label="Date of Birth *"
          type="date"
          value={data.dob || ""}
          onChange={(e) => onChange({ dob: e.target.value })}
          error={errors.dob}
          prefixIcon={<Calendar className="h-4 w-4" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Father / Mother / Spouse Name *"
          placeholder="Enter legal relative name"
          value={data.fatherOrSpouseName || ""}
          onChange={(e) => onChange({ fatherOrSpouseName: e.target.value })}
          error={errors.fatherOrSpouseName}
          required
        />

        <Input
          label="Occupation / Designation *"
          placeholder="e.g. Software Architect / Senior Consultant"
          value={data.occupation || ""}
          onChange={(e) => onChange({ occupation: e.target.value })}
          error={errors.occupation}
          prefixIcon={<Briefcase className="h-4 w-4" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Primary Mobile Number *"
          placeholder="+91 98765 43210"
          value={data.mobile || ""}
          onChange={(e) => onChange({ mobile: e.target.value })}
          error={errors.mobile}
          prefixIcon={<Phone className="h-4 w-4" />}
          helperText="SMS verification and updates will be dispatched here."
          required
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="yourname@domain.com"
          value={data.email || ""}
          onChange={(e) => onChange({ email: e.target.value })}
          error={errors.email}
          prefixIcon={<Mail className="h-4 w-4" />}
          helperText="Agreement & sanction notices will be delivered here."
          required
        />
      </div>

      <div className="space-y-4">
        <Textarea
          label="Current Residential Address *"
          placeholder="Full residential street, apartment/door number, locality, city, state, pincode"
          value={data.currentAddress || ""}
          onChange={(e) => handleCurrentAddressChange(e.target.value)}
          error={errors.currentAddress}
          rows={3}
          required
        />

        <div className="flex items-center space-x-2 pt-1">
          <input
            id="same-addr"
            type="checkbox"
            checked={sameAddress}
            onChange={(e) => handleSameAddressToggle(e.target.checked)}
            className="h-4 w-4 rounded border-charcoal-700 bg-charcoal-900 text-gold-500 focus:ring-gold-400 cursor-pointer"
          />
          <label htmlFor="same-addr" className="text-xs text-slate-300 select-none cursor-pointer">
            Permanent Address is identical to Current Residential Address
          </label>
        </div>

        {!sameAddress && (
          <Textarea
            label="Permanent Residential Address"
            placeholder="Permanent legal domicile address..."
            value={data.permanentAddress || ""}
            onChange={(e) => onChange({ permanentAddress: e.target.value })}
            rows={3}
          />
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-charcoal-800">
        <Button
          type="button"
          variant="luxury"
          size="lg"
          onClick={onNext}
          className="text-xs uppercase tracking-wider font-bold shadow-gold-md"
        >
          <span>Continue to Loan Details</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
