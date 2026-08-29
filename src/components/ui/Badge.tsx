import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-charcoal-700 text-slate-200",
        gold: "bg-gold-500/15 text-gold-300 border border-gold-500/30",
        submitted: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
        under_review: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
        approved: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        rejected: "bg-red-500/15 text-red-300 border border-red-500/30",
        active: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
        paid: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        overdue: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        info_required: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: string;
}

export function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  let resolvedVariant = variant || "default";

  if (status) {
    const s = status.toUpperCase();
    if (s === "SUBMITTED") resolvedVariant = "submitted";
    else if (s === "UNDER_REVIEW") resolvedVariant = "under_review";
    else if (s === "APPROVED" || s === "COMPLETED" || s === "PAID" || s === "AGREEMENT_SIGNED")
      resolvedVariant = "approved";
    else if (s === "REJECTED" || s === "CANCELLED" || s === "DEFAULTED")
      resolvedVariant = "rejected";
    else if (s === "ACTIVE") resolvedVariant = "active";
    else if (s === "OVERDUE") resolvedVariant = "overdue";
    else if (s === "ADDITIONAL_INFORMATION_REQUIRED") resolvedVariant = "info_required";
    else if (s === "AGREEMENT_PENDING" || s === "PENDING_SIGNATURE")
      resolvedVariant = "gold";
  }

  const formatStatus = (txt: string) => txt.replace(/_/g, " ");

  return (
    <div className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {children || (status ? formatStatus(status) : null)}
    </div>
  );
}
