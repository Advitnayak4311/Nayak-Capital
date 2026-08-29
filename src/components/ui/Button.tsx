import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-500 text-charcoal-950 font-semibold hover:bg-gold-400 active:scale-[0.98] shadow-gold-sm hover:shadow-gold-md",
        secondary:
          "bg-charcoal-800 text-gold-300 border border-gold-500/30 hover:bg-charcoal-700 hover:border-gold-500/60 active:scale-[0.98]",
        outline:
          "border border-charcoal-600 bg-transparent text-foreground hover:bg-charcoal-800/80 hover:border-gold-500/40",
        ghost:
          "text-slate-300 hover:text-gold-400 hover:bg-charcoal-800/60",
        danger:
          "bg-red-950/80 text-red-300 border border-red-800/50 hover:bg-red-900 hover:border-red-700",
        luxury:
          "bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 text-charcoal-950 font-bold hover:opacity-95 shadow-gold-md active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base font-semibold",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
