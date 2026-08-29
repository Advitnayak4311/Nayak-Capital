"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Lock, Mail, ShieldCheck, KeyRound, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      // Save token in localStorage for client-side API calls
      localStorage.setItem("nc_admin_token", data.token);
      localStorage.setItem("nc_admin_user", JSON.stringify(data.user));

      toast({
        title: "Session Authenticated",
        description: "Welcome to Nayak Capital Operational Dashboard.",
        type: "success",
      });

      router.push("/admin");
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-950 px-4 relative overflow-hidden py-12">
      {/* Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gold opacity-30 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <BrandLogo size="lg" href="/" />
          </div>
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 bg-charcoal-900 px-3 py-1 rounded-full border border-gold-500/30">
              Restricted Officer Portal
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-gold-500/30 bg-charcoal-900/95 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-white">Officer Authentication</h2>
            <p className="text-xs text-slate-400">
              Enter your authorized administrative credentials to access loan portfolios.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Administrative Email *"
              type="email"
              placeholder="officer@nayakcapital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefixIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Security Password *"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixIcon={<Lock className="h-4 w-4" />}
              required
            />

            <Button
              type="submit"
              variant="luxury"
              size="lg"
              className="w-full text-xs uppercase tracking-wider font-bold shadow-gold-md"
              isLoading={isLoading}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              <span>Verify & Access Portal</span>
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-500/70" />
          <span>All operational access is logged and audited.</span>
        </div>
      </div>
    </div>
  );
}
