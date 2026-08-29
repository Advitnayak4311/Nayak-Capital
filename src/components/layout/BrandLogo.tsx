import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  showTagline?: boolean;
}

export function BrandLogo({
  className,
  size = "md",
  href = "/",
  showTagline = true,
}: BrandLogoProps) {
  const content = (
    <div className={cn("flex items-center space-x-3 group select-none shrink-0", className)}>
      {/* Luxury Gold Crest Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 p-0.5 shadow-gold-sm transition-all duration-300 group-hover:shadow-gold-md group-hover:scale-105 shrink-0",
          size === "sm" && "h-8 w-8 rounded-lg",
          size === "md" && "h-10 w-10",
          size === "lg" && "h-14 w-14 rounded-2xl"
        )}
      >
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] bg-charcoal-950 px-1">
          <span
            className={cn(
              "font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gold-gradient",
              size === "sm" && "text-base",
              size === "md" && "text-xl",
              size === "lg" && "text-3xl"
            )}
          >
            NC
          </span>
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5 whitespace-nowrap flex-nowrap">
          <span
            className={cn(
              "font-serif font-bold tracking-wider text-white transition-colors group-hover:text-gold-200",
              size === "sm" && "text-sm",
              size === "md" && "text-lg",
              size === "lg" && "text-2xl"
            )}
          >
            NAYAK CAPITAL
          </span>
          <span
            className={cn(
              "font-sans font-bold tracking-widest text-gold-400 uppercase bg-gold-500/10 border border-gold-500/30 rounded px-1.5 py-0.5 leading-none",
              size === "sm" && "text-[8px]",
              size === "md" && "text-[10px]",
              size === "lg" && "text-xs"
            )}
          >
            LENDERS
          </span>
        </div>
        {showTagline && size !== "sm" && (
          <span className="text-[9px] font-medium tracking-[0.16em] text-slate-400 uppercase whitespace-nowrap">
            Trusted Loans. Stronger Futures.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
