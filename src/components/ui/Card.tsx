import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "luxury" | "interactive" | "glass";
  glow?: boolean;
}

export function Card({
  className,
  variant = "default",
  glow = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        variant === "default" &&
          "bg-charcoal-850/90 border-charcoal-700/80 text-foreground shadow-lg backdrop-blur-md",
        variant === "luxury" &&
          "bg-gradient-to-b from-charcoal-800/90 to-charcoal-900/95 border-gold-500/30 text-foreground shadow-card-luxury",
        variant === "glass" &&
          "bg-charcoal-900/60 border-white/10 backdrop-blur-xl text-foreground",
        variant === "interactive" &&
          "bg-charcoal-850/90 border-charcoal-700/80 hover:border-gold-500/50 hover:shadow-gold-sm hover:-translate-y-0.5 cursor-pointer",
        glow && "relative before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-gold-500/20 before:to-transparent before:-z-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-slate-400 leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0 border-t border-charcoal-700/40 mt-4", className)} {...props} />;
}
