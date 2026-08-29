"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Menu, X, Search } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null; // Admin has its own completely separate isolated shell
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-gold-500/20 bg-charcoal-950/90 backdrop-blur-xl shadow-2xl py-2.5"
          : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <BrandLogo size="md" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {siteConfig.navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                    isActive
                      ? "text-gold-400 bg-charcoal-800/80 border border-gold-500/30"
                      : "text-slate-300 hover:text-white hover:bg-charcoal-800/40"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/status"
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-1.5",
                pathname === "/status"
                  ? "text-gold-400 bg-charcoal-800/80 border border-gold-500/30"
                  : "text-slate-300 hover:text-white hover:bg-charcoal-800/40"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Track Status</span>
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/apply">
              <Button variant="primary" size="md" className="text-xs tracking-wider uppercase">
                Apply for a Loan
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <Link href="/apply">
              <Button variant="primary" size="sm" className="text-[11px] px-3">
                Apply
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gold-500/20 bg-charcoal-950/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {siteConfig.navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-gold-400 bg-charcoal-850 font-semibold border-l-2 border-gold-500"
                      : "text-slate-300 hover:bg-charcoal-850 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/status"
              className={cn(
                "px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2",
                pathname === "/status"
                  ? "text-gold-400 bg-charcoal-850 font-semibold border-l-2 border-gold-500"
                  : "text-slate-300 hover:bg-charcoal-850 hover:text-white"
              )}
            >
              <Search className="h-4 w-4" />
              <span>Track Application Status</span>
            </Link>
          </nav>
          <div className="pt-2">
            <Link href="/apply" className="block w-full">
              <Button variant="luxury" size="lg" className="w-full text-sm uppercase tracking-wider">
                Start Loan Application
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
