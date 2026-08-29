"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Landmark,
  ShieldCheck,
  Sliders,
  LogOut,
  ExternalLink,
  Search,
  Bell,
  Menu,
  X,
  UserCheck,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [adminUser, setAdminUser] = React.useState<any>(null);

  // If on /admin/login, render without sidebar shell
  const isLoginPage = pathname === "/admin/login";

  React.useEffect(() => {
    const userStr = localStorage.getItem("nc_admin_user");
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("nc_admin_token");
    localStorage.removeItem("nc_admin_user");
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Applications", href: "/admin/applications", icon: FileSpreadsheet },
    { label: "Active Loans & Ledger", href: "/admin/loans", icon: Landmark },
    { label: "Compliance & Audit", href: "/admin/audit-logs", icon: ShieldCheck },
    { label: "System Settings", href: "/admin/settings", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col md:flex-row text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-charcoal-800 bg-charcoal-900/95 p-5 shrink-0 min-h-screen">
        <div className="space-y-6">
          {/* Logo */}
          <div className="pb-4 border-b border-charcoal-800">
            <BrandLogo size="sm" href="/admin" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors",
                    isActive
                      ? "bg-gold-500 text-charcoal-950 shadow-gold-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-charcoal-800/80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Officer Profile & Logout */}
        <div className="pt-6 border-t border-charcoal-800 space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-charcoal-950/60 border border-charcoal-800">
            <div className="h-8 w-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="truncate text-xs">
              <p className="font-bold text-white truncate">
                {adminUser?.name || "Credit Underwriter"}
              </p>
              <p className="text-[10px] text-gold-400 uppercase font-mono tracking-widest">
                {adminUser?.role || "SUPER_ADMIN"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link href="/" target="_blank" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white justify-start">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                <span>Public Site</span>
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-charcoal-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-charcoal-900 border-b border-charcoal-800 px-4 py-3">
        <BrandLogo size="sm" href="/admin" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-charcoal-800"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-charcoal-900 border-b border-charcoal-800 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider",
                  isActive
                    ? "bg-gold-500 text-charcoal-950 font-bold"
                    : "text-slate-300 hover:bg-charcoal-800"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-charcoal-800 flex justify-between items-center">
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                <span>Public Site</span>
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={handleLogout} className="text-xs">
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-charcoal-950 overflow-x-hidden p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
