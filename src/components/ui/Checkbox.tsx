import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, checked, id, onChange, ...props }, ref) => {
    const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center pt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-charcoal-600 bg-charcoal-900 transition-all checked:border-gold-500 checked:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            ref={ref}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-1 h-4 w-4 text-charcoal-950 opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className="cursor-pointer text-sm font-medium text-slate-200 select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
            )}
            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
