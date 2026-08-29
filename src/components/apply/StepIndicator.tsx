import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full py-4">
      {/* Desktop Step Numbers and Titles */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Connecting Background Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-charcoal-800 -z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-gold-500 transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {stepTitles.map((title, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={idx}
              onClick={() => isCompleted && onStepClick && onStepClick(stepNum)}
              className={cn(
                "flex flex-col items-center relative z-10 select-none",
                isCompleted ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200",
                  isCompleted &&
                    "border-gold-500 bg-gold-500 text-charcoal-950 shadow-gold-sm",
                  isCurrent &&
                    "border-gold-400 bg-charcoal-900 text-gold-300 ring-4 ring-gold-500/20",
                  !isCompleted &&
                    !isCurrent &&
                    "border-charcoal-700 bg-charcoal-900 text-slate-500"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : stepNum}
              </div>
              <span
                className={cn(
                  "mt-2 text-[11px] font-semibold uppercase tracking-wider transition-colors text-center",
                  isCurrent ? "text-gold-400" : isCompleted ? "text-slate-300" : "text-slate-500"
                )}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Compact Indicator */}
      <div className="md:hidden flex items-center justify-between bg-charcoal-900/90 rounded-xl border border-charcoal-750 p-3.5 shadow-md">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">
            Step {currentStep} of {totalSteps}
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            {stepTitles[currentStep - 1]}
          </p>
        </div>
        <div className="flex items-center space-x-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                i + 1 === currentStep
                  ? "w-6 bg-gold-400"
                  : i + 1 < currentStep
                  ? "w-2 bg-gold-600"
                  : "w-2 bg-charcoal-750"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
