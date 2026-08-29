"use client";

import * as React from "react";
import Link from "next/link";
import { LoanApplication, ApplicationStatus } from "@/lib/models/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, RefreshCw, ArrowUpDown, FileText, ChevronRight } from "lucide-react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = React.useState<LoanApplication[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sortOrder, setSortOrder] = React.useState<"date_desc" | "date_asc" | "amount_desc">("date_desc");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/applications", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  const statuses = [
    { value: "ALL", label: "All Records" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "AGREEMENT_PENDING", label: "Agreement Pending" },
    { value: "AGREEMENT_SIGNED", label: "Signed" },
    { value: "ACTIVE", label: "Active Loans" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const filteredApplications = React.useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (statusFilter !== "ALL" && app.status !== statusFilter) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = app.applicationId.toLowerCase().includes(q);
          const matchName = app.borrower.fullName.toLowerCase().includes(q);
          const matchMobile = app.borrower.mobile.includes(q);
          const matchEmail = app.borrower.email.toLowerCase().includes(q);
          return matchId || matchName || matchMobile || matchEmail;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "date_desc") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortOrder === "date_asc") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortOrder === "amount_desc") {
          return b.loan.amount - a.loan.amount;
        }
        return 0;
      });
  }, [applications, searchQuery, statusFilter, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Pipeline Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Credit Applications Data Grid
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchApplications}
          isLoading={isLoading}
          className="text-xs text-slate-300 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          <span>Refresh Records</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search by Application ID (NC-APP-...), Borrower Name, Mobile, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="sm:col-span-4 flex items-center space-x-2">
            <div className="w-full">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="flex h-11 w-full appearance-none rounded-lg border border-charcoal-700 bg-charcoal-900 px-3.5 py-2 text-xs font-medium text-foreground focus:border-gold-500/80 focus:outline-none"
              >
                <option value="date_desc">Sort: Newest First</option>
                <option value="date_asc">Sort: Oldest First</option>
                <option value="amount_desc">Sort: Highest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === st.value
                  ? "bg-gold-500 text-charcoal-950 shadow-gold-sm"
                  : "bg-charcoal-800 text-slate-400 hover:text-white hover:bg-charcoal-750"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3.5 font-semibold">Ref ID</th>
                <th className="pb-3.5 font-semibold">Borrower Name</th>
                <th className="pb-3.5 font-semibold">Contact & City</th>
                <th className="pb-3.5 font-semibold">Facility Type</th>
                <th className="pb-3.5 font-semibold">Principal Sum</th>
                <th className="pb-3.5 font-semibold">Submitted</th>
                <th className="pb-3.5 font-semibold">Current Status</th>
                <th className="pb-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No applications match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-charcoal-850/60 transition-colors group">
                    <td className="py-4 font-mono font-bold text-gold-300">
                      {app.applicationId}
                    </td>
                    <td className="py-4 font-semibold text-white">
                      {app.borrower.fullName}
                      <p className="text-[10px] text-slate-400 font-normal">{app.borrower.occupation}</p>
                    </td>
                    <td className="py-4 text-slate-300">
                      <p>{app.borrower.mobile}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {app.borrower.email}
                      </p>
                    </td>
                    <td className="py-4 text-slate-300">{app.loan.productName}</td>
                    <td className="py-4 font-mono font-bold text-white">
                      {formatCurrency(app.loan.amount)}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {app.loan.tenureMonths} Mo @ {app.loan.proposedInterestRateAnnual}%
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{formatDate(app.createdAt)}</td>
                    <td className="py-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/admin/applications/${app.applicationId}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[11px] h-8 px-3 font-semibold group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-colors"
                        >
                          <span>360° Review</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
