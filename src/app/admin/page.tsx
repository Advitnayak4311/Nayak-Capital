"use client";

import * as React from "react";
import Link from "next/link";
import { LoanApplication, LoanRecord } from "@/lib/models/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Landmark,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [applications, setApplications] = React.useState<LoanApplication[]>([]);
  const [loans, setLoans] = React.useState<LoanRecord[]>([]);
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Instant hydration from persistent local storage
      if (typeof window !== "undefined") {
        const cachedLoans = localStorage.getItem("nc_admin_loans");
        const cachedApps = localStorage.getItem("nc_admin_applications");
        if (cachedLoans) {
          try {
            const parsed = JSON.parse(cachedLoans);
            if (Array.isArray(parsed) && parsed.length > 0) setLoans(parsed);
          } catch (e) {}
        }
        if (cachedApps) {
          try {
            const parsed = JSON.parse(cachedApps);
            if (Array.isArray(parsed) && parsed.length > 0) setApplications(parsed);
          } catch (e) {}
        }
      }

      const [appRes, statRes, loanRes] = await Promise.all([
        fetch("/api/applications", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch("/api/admin/stats", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch("/api/loans", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      ]);

      const appData = await appRes.json();
      const statData = await statRes.json();
      const loanData = await loanRes.json();

      let currentLoans: LoanRecord[] = [];
      let currentApps: LoanApplication[] = [];

      if (appData.success && Array.isArray(appData.applications)) currentApps = appData.applications;
      if (statData.success && statData.stats) setStats(statData.stats);
      if (loanData.success && Array.isArray(loanData.loans)) currentLoans = loanData.loans;

      // Merge with localStorage if backend cold-started empty
      if (typeof window !== "undefined") {
        const cachedLoans = localStorage.getItem("nc_admin_loans");
        if (cachedLoans && currentLoans.length === 0) {
          try {
            const parsed: LoanRecord[] = JSON.parse(cachedLoans);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentLoans = parsed;
              for (const l of parsed) {
                fetch("/api/loans", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(l),
                }).catch(() => {});
              }
            }
          } catch (e) {}
        } else if (currentLoans.length > 0) {
          localStorage.setItem("nc_admin_loans", JSON.stringify(currentLoans));
        }

        if (currentApps.length > 0) {
          localStorage.setItem("nc_admin_applications", JSON.stringify(currentApps));
        }
      }

      setApplications(currentApps);
      setLoans(currentLoans);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Live reactive metrics computed directly from state
  const effectiveLoans = React.useMemo(() => {
    if (loans.length > 0) return loans;
    return applications.map((app) => ({
      id: app.id,
      loanId: app.applicationId.replace("NC-APP-", "NC-LN-"),
      applicationId: app.applicationId,
      borrowerName: app.borrower.fullName,
      borrowerMobile: app.borrower.mobile,
      borrowerEmail: app.borrower.email,
      principalAmount: app.loan.amount,
      interestRateAnnual: app.loan.proposedInterestRateAnnual || (app.loan.tenureMonths <= 3 ? 13.5 : 14.7),
      totalPayable: app.loan.estimatedTotalPayable || (app.loan.amount + Math.round(app.loan.amount * ((app.loan.proposedInterestRateAnnual || 13.5) / 100))),
      totalPaid: 0,
      outstandingBalance: app.loan.estimatedTotalPayable || (app.loan.amount + Math.round(app.loan.amount * ((app.loan.proposedInterestRateAnnual || 13.5) / 100))),
      tenureMonths: app.loan.tenureMonths,
      disbursementDate: (app.loan.proposedDisbursementDate || app.createdAt).split("T")[0],
      repaymentFrequency: app.loan.repaymentFrequency || "MONTHLY",
      nextDueDate: (app.loan.proposedDisbursementDate || app.createdAt).split("T")[0],
      status: "ACTIVE" as const,
      schedule: [],
      repayments: [],
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));
  }, [loans, applications]);

  const totalAppsCount = applications.length;
  const pendingCount = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  ).length;
  const activeCount = effectiveLoans.length;
  const disbursedTotal = effectiveLoans.reduce((sum, l) => sum + (Number(l.principalAmount) || 0), 0);
  const collectedTotal = effectiveLoans.reduce((sum, l) => sum + (Number(l.totalPaid) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Portfolio Management & Underwriting
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Executive Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={isLoading}
            className="text-xs text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Refresh Live Data</span>
          </Button>
          <Link href="/admin/loans">
            <Button variant="luxury" size="sm" className="text-xs uppercase tracking-wider font-bold">
              <span>+ Add Client Loan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Applications
            </span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {totalAppsCount}
          </div>
          <p className="text-[11px] text-slate-400">Lifetime submissions recorded</p>
        </div>

        <div className="rounded-2xl border border-gold-500/30 bg-charcoal-900/90 p-5 space-y-2 shadow-gold-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Pending Appraisal
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-gold-300">
            {pendingCount}
          </div>
          <p className="text-[11px] text-amber-400/80">Requires credit appraisal & review</p>
        </div>

        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Client Accounts
            </span>
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {activeCount}
          </div>
          <p className="text-[11px] text-slate-400">Currently servicing debt facilities</p>
        </div>

        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Disbursed Capital
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-300">
            {formatCurrency(disbursedTotal)}
          </div>
          <p className="text-[11px] text-slate-400">
            Collected: {formatCurrency(collectedTotal)}
          </p>
        </div>
      </div>

      {/* Active Debt Portfolio & Servicing Ledger Table */}
      <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">
              Live Debt Portfolio
            </span>
            <h2 className="text-lg font-serif font-bold text-white mt-0.5">
              Active Client Loans & Ledgers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time balance, interest yield, and recovery tracking for all institutional accounts.
            </p>
          </div>
          <Link href="/admin/loans">
            <Button variant="ghost" size="sm" className="text-xs text-gold-400 hover:text-gold-300">
              <span>View All Ledgers</span>
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {effectiveLoans.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-charcoal-750 rounded-2xl">
            <p className="text-xs text-slate-400">No active loans recorded yet.</p>
            <Link href="/admin/loans" className="inline-block mt-3">
              <Button variant="secondary" size="sm" className="text-xs">
                + Add Your First Client Loan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Loan Account</th>
                  <th className="pb-3 font-semibold">Borrower Name & Contact</th>
                  <th className="pb-3 font-semibold">Principal & Rate</th>
                  <th className="pb-3 font-semibold">Total Payable</th>
                  <th className="pb-3 font-semibold">Recovered</th>
                  <th className="pb-3 font-semibold">Outstanding</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800/60">
                {effectiveLoans.slice(0, 5).map((loan) => (
                  <tr key={loan.id} className="hover:bg-charcoal-850/60 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-gold-300">
                      {loan.loanId}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-white">{loan.borrowerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{loan.borrowerMobile}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-mono font-bold text-white">{formatCurrency(loan.principalAmount)}</div>
                      <div className="text-[11px] text-emerald-400">{loan.interestRateAnnual}% flat ({loan.tenureMonths} Mo)</div>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      {formatCurrency(loan.totalPayable)}
                    </td>
                    <td className="py-3.5 font-mono font-semibold text-emerald-400">
                      {formatCurrency(loan.totalPaid)}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-amber-300">
                      {formatCurrency(loan.outstandingBalance)}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        loan.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        loan.status === "PAID" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link href={`/admin/loans/${loan.loanId}`}>
                        <Button variant="secondary" size="sm" className="text-[11px] h-7 px-2.5">
                          Ledger &rarr;
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Applications Pipeline */}
      <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">
              Inbound Pipeline
            </span>
            <h2 className="text-lg font-serif font-bold text-white mt-0.5">
              Recent Borrower Applications
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live stream of submitted credit applications and verification progress.
            </p>
          </div>
          <Link href="/admin/applications">
            <Button variant="ghost" size="sm" className="text-xs text-gold-400 hover:text-gold-300">
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-charcoal-750 rounded-2xl">
            <p className="text-xs text-slate-400">No applications submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Application ID</th>
                  <th className="pb-3 font-semibold">Borrower Name</th>
                  <th className="pb-3 font-semibold">Facility Category</th>
                  <th className="pb-3 font-semibold">Requested Sum</th>
                  <th className="pb-3 font-semibold">Submission Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800/60">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-charcoal-850/60 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-gold-300">
                      {app.applicationId}
                    </td>
                    <td className="py-3.5 font-semibold text-white">
                      {app.borrower.fullName}
                    </td>
                    <td className="py-3.5 text-slate-300">{app.loan.productName}</td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      {formatCurrency(app.loan.amount)}
                    </td>
                    <td className="py-3.5 text-slate-400">{formatDate(app.createdAt)}</td>
                    <td className="py-3.5">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link href={`/admin/applications/${app.applicationId}`}>
                        <Button variant="secondary" size="sm" className="text-[11px] h-7 px-2.5">
                          Review &rarr;
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
