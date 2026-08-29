"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { siteConfig } from "@/config/site";
import { Phone, Mail, Clock, ShieldCheck } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null; // Admin has its own dedicated shell
  }

  return (
    <footer className="w-full border-t border-gold-500/20 bg-charcoal-950 text-slate-300 pt-16 pb-12 relative overflow-hidden">
      {/* Background Subtle Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-radial-gold pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gold-400/90 pt-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-gold-400" />
              <span>Encrypted 256-Bit Financial Data Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-charcoal-800 pb-2">
              Lending Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/loans" className="hover:text-gold-300 transition-colors">
                  Personal Loans (13.5% Fixed)
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-gold-300 transition-colors">
                  Lending Workflow & Timeline
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-gold-400 font-semibold hover:text-gold-300 transition-colors">
                  Apply for Personal Loan &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-charcoal-800 pb-2">
              Governance & Tracking
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-gold-300 transition-colors">
                  About Nayak Capital
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-gold-300 transition-colors">
                  Track Application Status
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-300 transition-colors">
                  Contact & Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-charcoal-800 pb-2">
              Contact Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`} className="hover:text-gold-300">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-gold-300">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Operating Hours: 09:00 - 19:00 IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-charcoal-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All institutional rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-slate-400 text-[11px]">
            <span>Personal Loan Division</span>
            <span>&bull;</span>
            <span>Direct Financial Facilitation</span>
            <span>&bull;</span>
            <span>Confidential & Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
