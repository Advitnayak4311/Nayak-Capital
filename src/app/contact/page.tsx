"use client";

import * as React from "react";
import { siteConfig } from "@/config/site";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Phone, Mail, Clock, ShieldCheck, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    mobile: "",
    inquiryType: "PERSONAL_LOAN_INQUIRY",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill out your full name, email address, and message.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to transmit inquiry.");
      }

      setIsSent(true);
      toast({
        title: "Message Transmitted Successfully",
        description: "Our Personal Loan Desk has received your inquiry and sent a confirmation to your email.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Transmission Failed",
        description: err.message || "Could not send message. Please try calling directly.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-charcoal-900 px-4 py-1.5 shadow-gold-sm">
          <ShieldCheck className="h-4 w-4 text-gold-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            Personal Loan Contact Desk
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          Connect with Nayak Capital
        </h1>
        <p className="text-base text-slate-300">
          Our loan desk is available to assist you with personal loan inquiries, application tracking, and repayment questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Direct Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-serif font-bold text-white">
              Direct Contact Details
            </h2>

            <div className="space-y-6 text-sm">
              <div className="flex items-start space-x-3.5">
                <div className="rounded-lg bg-charcoal-800 p-2.5 border border-gold-500/20 text-gold-400 shrink-0 mt-0.5">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Phone Desk</h4>
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
                    className="text-base font-semibold text-white mt-0.5 hover:text-gold-300 block"
                  >
                    {siteConfig.contact.phone}
                  </a>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct loan inquiry & assistance line
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="rounded-lg bg-charcoal-800 p-2.5 border border-gold-500/20 text-gold-400 shrink-0 mt-0.5">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Electronic Mail</h4>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="text-base font-semibold text-gold-300 mt-0.5 hover:underline block"
                  >
                    {siteConfig.contact.email}
                  </a>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official loan services & documentation desk
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="rounded-lg bg-charcoal-800 p-2.5 border border-gold-500/20 text-gold-400 shrink-0 mt-0.5">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Support Hours</h4>
                  <p className="text-sm font-medium text-white mt-0.5">
                    {siteConfig.contact.hours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950/70 p-6 space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider">Confidentiality Standard</h4>
            <p className="leading-relaxed">
              All personal communications and submitted documents are handled with strict privacy and secure encryption.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-charcoal-700 bg-charcoal-900/90 p-8 sm:p-10 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">
                Send a Message
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Leave your details below and a personal loan officer will connect with you.
              </p>
            </div>

            {isSent ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-white">Inquiry Received</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your message has been sent to our personal loan desk. We will reach out to you via phone or email shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsSent(false);
                    setFormData({
                      fullName: "",
                      email: "",
                      mobile: "",
                      inquiryType: "PERSONAL_LOAN_INQUIRY",
                      message: "",
                    });
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="yourname@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Contact *"
                    placeholder="+91 98000 00000"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="flex h-11 w-full rounded-lg border border-charcoal-700 bg-charcoal-900 px-3.5 py-2 text-sm text-foreground focus:border-gold-500/80 focus:outline-none"
                    >
                      <option value="PERSONAL_LOAN_INQUIRY">Personal Loan Inquiry</option>
                      <option value="APPLICATION_SUPPORT">Existing Application Support</option>
                      <option value="GENERAL_QUESTION">General Question</option>
                    </select>
                  </div>
                </div>

                <Textarea
                  label="Message / Requirements *"
                  rows={4}
                  placeholder="Describe your personal loan requirement, desired amount, or question..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />

                <Button
                  type="submit"
                  variant="luxury"
                  size="lg"
                  className="w-full text-xs uppercase tracking-wider font-bold shadow-gold-md"
                  isLoading={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  <span>Transmit Inquiry</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
