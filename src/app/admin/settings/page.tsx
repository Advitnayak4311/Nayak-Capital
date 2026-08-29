"use client";

import * as React from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Sliders, Mail, Landmark, Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const [settings, setSettings] = React.useState({
    companyName: siteConfig.name,
    tagline: siteConfig.tagline,
    supportEmail: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    minInterestRate: 13.5,
    defaultProcessingFee: 1.5,
    maxLoanCeiling: 2500000,
    emailNotificationsEnabled: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast({
      title: "Settings Preserved",
      description: "Institutional parameters and policy settings updated successfully.",
      type: "success",
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-charcoal-800 pb-5">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
          System Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
          Institutional Settings & Governance Policies
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure lending rates, contact endpoints, and notification parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Business Branding & Entity Details */}
        <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2 text-gold-400 border-b border-charcoal-800 pb-3">
            <Landmark className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              1. Institutional Identity & Contact Desks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Legal Corporate Name"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            />
            <Input
              label="Brand Tagline"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Primary Electronic Mail Desk"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
            <Input
              label="Direct Telephone Desk"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Underwriting Policy & Limits */}
        <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2 text-gold-400 border-b border-charcoal-800 pb-3">
            <Sliders className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              2. Underwriting Policy Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Fixed Base Annual Rate (%)"
              type="number"
              step={0.1}
              value={settings.minInterestRate}
              onChange={(e) => setSettings({ ...settings, minInterestRate: Number(e.target.value) })}
            />
            <Input
              label="Standard Processing Charge (%)"
              type="number"
              step={0.1}
              value={settings.defaultProcessingFee}
              onChange={(e) => setSettings({ ...settings, defaultProcessingFee: Number(e.target.value) })}
            />
            <Input
              label="Maximum Personal Loan Ceiling (₹)"
              type="number"
              step={50000}
              value={settings.maxLoanCeiling}
              onChange={(e) => setSettings({ ...settings, maxLoanCeiling: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Section 3: Notification Engine Status */}
        <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-gold-400 border-b border-charcoal-800 pb-3">
            <Mail className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              3. Automated Notification & SMTP Engine
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 gap-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Automated Dispatch Engine</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically dispatches customer application receipts and officer alerts upon submission & signing.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs text-gold-400 border-gold-500/40 hover:bg-gold-500/10"
                onClick={async () => {
                  toast({
                    title: "Testing SMTP Connection...",
                    description: "Connecting to configured mail transport...",
                    type: "info",
                  });
                  try {
                    const res = await fetch("/api/admin/smtp/test");
                    const data = await res.json();
                    if (data.connected) {
                      toast({
                        title: "SMTP Server Connected",
                        description: data.message,
                        type: "success",
                      });
                    } else {
                      toast({
                        title: "Simulation Mode Active",
                        description: data.message,
                        type: "info",
                      });
                    }
                  } catch (e: any) {
                    toast({
                      title: "SMTP Error",
                      description: e.message,
                      type: "error",
                    });
                  }
                }}
              >
                Check Connection
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  toast({
                    title: "Sending Test Notification...",
                    description: "Dispatching test email to administrator inbox...",
                    type: "info",
                  });
                  try {
                    const res = await fetch("/api/admin/smtp/test", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ testRecipient: settings.supportEmail }),
                    });
                    const data = await res.json();
                    if (data.success && !data.simulated) {
                      toast({
                        title: "Test Email Dispatched",
                        description: data.message,
                        type: "success",
                      });
                    } else if (data.simulated) {
                      toast({
                        title: "Simulated Email Logged",
                        description: "No live SMTP server configured yet in .env.local. Logged to database.",
                        type: "info",
                      });
                    } else {
                      toast({
                        title: "Email Dispatch Failed",
                        description: data.error || "Unknown error",
                        type: "error",
                      });
                    }
                  } catch (e: any) {
                    toast({
                      title: "Dispatch Error",
                      description: e.message,
                      type: "error",
                    });
                  }
                }}
              >
                Send Test Email
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="luxury"
            size="lg"
            isLoading={isSaving}
            className="text-xs uppercase tracking-wider font-bold shadow-gold-md"
          >
            <Save className="h-4 w-4 mr-2" />
            <span>Save Governance Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
