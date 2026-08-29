"use client";

import * as React from "react";
import Link from "next/link";
import { LoanRecord, LoanStatus, LoanApplication } from "@/lib/models/types";
import { formatCurrency, formatDate, calculateEMI } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import {
  Landmark,
  Search,
  RefreshCw,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function AdminLoansPage() {
  const { toast } = useToast();
  const [loans, setLoans] = React.useState<LoanRecord[]>([]);
  const [applications, setApplications] = React.useState<LoanApplication[]>([]);
  const [activeTab, setActiveTab] = React.useState<"loans" | "applications">("loans");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isActivatingAppId, setIsActivatingAppId] = React.useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedLoan, setSelectedLoan] = React.useState<LoanRecord | null>(null);

  // Add Form State
  const [addForm, setAddForm] = React.useState({
    borrowerName: "",
    borrowerMobile: "",
    borrowerEmail: "",
    principalAmount: 100000,
    tenureMonths: 3,
    interestRateAnnual: 13.5,
    disbursementDate: new Date().toISOString().split("T")[0],
    repaymentFrequency: "MONTHLY",
    status: "ACTIVE",
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = React.useState(false);

  // Edit Form State
  const [editForm, setEditForm] = React.useState({
    borrowerName: "",
    borrowerMobile: "",
    borrowerEmail: "",
    principalAmount: 0,
    interestRateAnnual: 13.5,
    totalPaid: 0,
    outstandingBalance: 0,
    status: "ACTIVE" as LoanStatus,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = React.useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [loansRes, appsRes] = await Promise.all([
        fetch("/api/loans", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch("/api/applications", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      ]);

      const [loansData, appsData] = await Promise.all([
        loansRes.json(),
        appsRes.json(),
      ]);

      if (loansData.success) {
        setLoans(loansData.loans || []);
      }
      if (appsData.success) {
        setApplications(appsData.applications || []);
      }
    } catch (err) {
      console.error("Failed to load portfolio data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Update interest rate default when tenure changes in add form
  const handleTenureChange = (months: number) => {
    const defaultRate = months <= 3 ? 13.5 : 14.7;
    setAddForm((prev) => ({
      ...prev,
      tenureMonths: months,
      interestRateAnnual: defaultRate,
    }));
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.borrowerName.trim() || !addForm.principalAmount || !addForm.tenureMonths) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide the borrower name, principal amount, and tenure.",
        type: "error",
      });
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create loan record.");
      }

      if (data.loan) {
        setLoans((prev) => [data.loan, ...prev.filter((l) => l.loanId !== data.loan.loanId)]);
      }
      setActiveTab("loans");

      toast({
        title: "Loan Record Created",
        description: `Loan account ${data.loan.loanId} for ${data.loan.borrowerName} is now active in the ledger.`,
        type: "success",
      });

      setIsAddModalOpen(false);
      setAddForm({
        borrowerName: "",
        borrowerMobile: "",
        borrowerEmail: "",
        principalAmount: 100000,
        tenureMonths: 3,
        interestRateAnnual: 13.5,
        disbursementDate: new Date().toISOString().split("T")[0],
        repaymentFrequency: "MONTHLY",
        status: "ACTIVE",
      });
      fetchData();
    } catch (err: any) {
      toast({
        title: "Creation Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleQuickActivate = async (app: LoanApplication) => {
    setIsActivatingAppId(app.applicationId);
    try {
      const rate = app.loan.proposedInterestRateAnnual || (app.loan.tenureMonths <= 3 ? 13.5 : 14.7);
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName: app.borrower.fullName,
          borrowerMobile: app.borrower.mobile,
          borrowerEmail: app.borrower.email,
          principalAmount: app.loan.amount,
          tenureMonths: app.loan.tenureMonths,
          interestRateAnnual: rate,
          disbursementDate: new Date().toISOString().split("T")[0],
          repaymentFrequency: app.loan.repaymentFrequency || "MONTHLY",
          status: "ACTIVE",
          notes: `Activated directly from application ${app.applicationId}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Activation failed");

      // Update application status to ACTIVE
      await fetch(`/api/applications/${app.applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACTIVE",
          note: `Loan account ${data.loan.loanId} activated and posted to debt ledger.`,
          changedBy: "Advith Nayak (Admin)",
        }),
      });

      toast({
        title: "Loan Activated & Ledger Created!",
        description: `Loan account ${data.loan.loanId} for ${app.borrower.fullName} is now active.`,
        type: "success",
      });

      fetchData();
      setActiveTab("loans");
    } catch (err: any) {
      toast({
        title: "Activation Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsActivatingAppId(null);
    }
  };

  const openEditModal = (loan: LoanRecord) => {
    setSelectedLoan(loan);
    setEditForm({
      borrowerName: loan.borrowerName,
      borrowerMobile: loan.borrowerMobile,
      borrowerEmail: loan.borrowerEmail,
      principalAmount: loan.principalAmount,
      interestRateAnnual: loan.interestRateAnnual,
      totalPaid: loan.totalPaid,
      outstandingBalance: loan.outstandingBalance,
      status: loan.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/loans/${selectedLoan.loanId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update loan record.");
      }

      toast({
        title: "Loan Record Updated",
        description: `Account ${selectedLoan.loanId} has been successfully updated.`,
        type: "success",
      });

      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast({
        title: "Update Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openDeleteModal = (loan: LoanRecord) => {
    setSelectedLoan(loan);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLoan = async () => {
    if (!selectedLoan) return;

    setIsSubmittingDelete(true);
    try {
      const res = await fetch(`/api/loans/${selectedLoan.loanId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete loan record.");
      }

      toast({
        title: "Loan Record Removed",
        description: `Account ${selectedLoan.loanId} permanently deleted.`,
        type: "success",
      });

      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast({
        title: "Deletion Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      loan.loanId.toLowerCase().includes(q) ||
      loan.borrowerName.toLowerCase().includes(q) ||
      loan.applicationId?.toLowerCase().includes(q)
    );
  });

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.applicationId.toLowerCase().includes(q) ||
      app.borrower.fullName.toLowerCase().includes(q) ||
      app.borrower.mobile.includes(q) ||
      app.borrower.email.toLowerCase().includes(q)
    );
  });

  const pendingApps = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Institutional Debt Portfolio & Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Client Loan & Portfolio Management
          </h1>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={isLoading}
            className="text-xs text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="luxury"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold shadow-gold-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Client Loan</span>
          </Button>
        </div>
      </div>

      {/* Pipeline Alert Banner (if pending applications exist) */}
      {pendingApps.length > 0 && (
        <div className="rounded-2xl border border-gold-500/40 bg-gradient-to-r from-charcoal-900 via-charcoal-850 to-charcoal-900 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-white text-sm">
                  {pendingApps.length} New Application{pendingApps.length > 1 ? "s" : ""} in Underwriting Pipeline
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest: <strong className="text-slate-200">{pendingApps[0].borrower.fullName}</strong> requested{" "}
                <strong className="text-gold-300 font-mono">{formatCurrency(pendingApps[0].loan.amount)}</strong> ({pendingApps[0].loan.tenureMonths} Mo @ {pendingApps[0].loan.proposedInterestRateAnnual || 13.5}%)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("applications")}
              className="text-xs text-gold-300 border-gold-500/40 hover:bg-gold-500/10"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              <span>View In Pipeline ({applications.length})</span>
            </Button>
            <Button
              variant="luxury"
              size="sm"
              onClick={() => handleQuickActivate(pendingApps[0])}
              isLoading={isActivatingAppId === pendingApps[0].applicationId}
              className="text-xs font-bold shadow-gold-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Quick Activate</span>
            </Button>
          </div>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Dual Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-charcoal-900 border border-charcoal-750 self-start">
          <button
            onClick={() => setActiveTab("loans")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "loans"
                ? "bg-gold-500 text-charcoal-950 shadow-gold-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Active Loans & Ledgers ({loans.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "applications"
                ? "bg-gold-500 text-charcoal-950 shadow-gold-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Submitted Applications ({applications.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <Input
            placeholder={
              activeTab === "loans"
                ? "Search Loan ID, Name..."
                : "Search Application ID, Name, Phone..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefixIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE LOANS DATA GRID */}
      {/* ========================================================================= */}
      {activeTab === "loans" && (
        <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3.5 font-semibold">Loan Account</th>
                  <th className="pb-3.5 font-semibold">Borrower Name & Contact</th>
                  <th className="pb-3.5 font-semibold">Principal</th>
                  <th className="pb-3.5 font-semibold">Rate</th>
                  <th className="pb-3.5 font-semibold">Recovered</th>
                  <th className="pb-3.5 font-semibold">Outstanding</th>
                  <th className="pb-3.5 font-semibold">Next Due</th>
                  <th className="pb-3.5 font-semibold">Status</th>
                  <th className="pb-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800/60">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <Landmark className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-300">No active loan accounts in ledger</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {applications.length > 0 ? (
                          <>
                            You have <strong className="text-gold-400">{applications.length} submitted application(s)</strong>. Switch to the{" "}
                            <button
                              onClick={() => setActiveTab("applications")}
                              className="text-gold-300 underline font-semibold"
                            >
                              Submitted Applications tab
                            </button>{" "}
                            to review or activate them.
                          </>
                        ) : (
                          <>
                            Click <strong className="text-gold-400">"Add Client Loan"</strong> to register your clients directly.
                          </>
                        )}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-charcoal-850/60 transition-colors group">
                      <td className="py-4 font-mono font-bold text-gold-300">
                        {loan.loanId}
                      </td>
                      <td className="py-4 font-semibold text-white">
                        {loan.borrowerName}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {loan.borrowerMobile} &bull; {loan.borrowerEmail}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-white">
                        {formatCurrency(loan.principalAmount)}
                      </td>
                      <td className="py-4 font-mono text-emerald-400 font-medium">
                        {loan.interestRateAnnual}%
                      </td>
                      <td className="py-4 font-mono font-semibold text-emerald-400">
                        {formatCurrency(loan.totalPaid)}
                      </td>
                      <td className="py-4 font-mono font-bold text-gold-400">
                        {formatCurrency(loan.outstandingBalance)}
                      </td>
                      <td className="py-4 text-slate-300">
                        {formatDate(loan.nextDueDate)}
                      </td>
                      <td className="py-4">
                        <Badge status={loan.status} />
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link href={`/admin/loans/${loan.loanId}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[11px] h-8 px-2.5 font-semibold hover:bg-gold-500 hover:text-charcoal-950 transition-colors"
                              title="Open Ledger & Installments"
                            >
                              <span>Ledger</span>
                              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                            </Button>
                          </Link>

                          <button
                            onClick={() => openEditModal(loan)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-gold-300 hover:bg-charcoal-800 transition-colors"
                            title="Edit Loan Details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => openDeleteModal(loan)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-charcoal-800 transition-colors"
                            title="Remove / Delete Loan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPLICATIONS PIPELINE DATA GRID */}
      {/* ========================================================================= */}
      {activeTab === "applications" && (
        <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3.5 font-semibold">Application Ref</th>
                  <th className="pb-3.5 font-semibold">Applicant Name & Contact</th>
                  <th className="pb-3.5 font-semibold">Facility & Principal</th>
                  <th className="pb-3.5 font-semibold">Tenure & Rate</th>
                  <th className="pb-3.5 font-semibold">Est. Installment</th>
                  <th className="pb-3.5 font-semibold">Submitted</th>
                  <th className="pb-3.5 font-semibold">Status</th>
                  <th className="pb-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800/60">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <FileSpreadsheet className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-300">No applications in pipeline</p>
                      <p className="text-xs text-slate-500 mt-1">
                        New applications submitted via the borrower portal will automatically appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const emi =
                      app.loan.estimatedEMI ||
                      calculateEMI(
                        app.loan.amount,
                        app.loan.proposedInterestRateAnnual || (app.loan.tenureMonths <= 3 ? 13.5 : 14.7),
                        app.loan.tenureMonths
                      ).emi;

                    return (
                      <tr key={app.id} className="hover:bg-charcoal-850/60 transition-colors group">
                        <td className="py-4 font-mono font-bold text-gold-300">
                          {app.applicationId}
                        </td>
                        <td className="py-4 font-semibold text-white">
                          {app.borrower.fullName}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {app.borrower.mobile} &bull; {app.borrower.email}
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-white">
                          {formatCurrency(app.loan.amount)}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal">
                            {app.loan.productName || "Personal Loan"}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300 font-medium">
                          {app.loan.tenureMonths} Months
                          <span className="block text-[10px] text-emerald-400 font-mono">
                            {app.loan.proposedInterestRateAnnual || (app.loan.tenureMonths <= 3 ? 13.5 : 14.7)}% Flat
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-gold-300">
                          {formatCurrency(emi)}
                        </td>
                        <td className="py-4 text-slate-400 text-[11px]">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="py-4">
                          <Badge status={app.status} />
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/admin/applications/${app.applicationId}`}>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-[11px] h-8 px-2.5 font-semibold hover:bg-gold-500 hover:text-charcoal-950 transition-colors"
                              >
                                <span>Review 360</span>
                                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                              </Button>
                            </Link>

                            {app.status !== "ACTIVE" && (
                              <Button
                                variant="luxury"
                                size="sm"
                                onClick={() => handleQuickActivate(app)}
                                isLoading={isActivatingAppId === app.applicationId}
                                className="text-[11px] h-8 px-2.5 font-bold shadow-gold-sm"
                                title="Activate loan and generate portfolio ledger"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                <span>Activate</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW CLIENT LOAN MODAL */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client Loan Account"
        description="Register a new or existing client debt facility into the portfolio ledger."
      >
        <form onSubmit={handleCreateLoan} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Borrower Full Name *"
              placeholder="e.g. Ramesh Kumar"
              value={addForm.borrowerName}
              onChange={(e) => setAddForm({ ...addForm, borrowerName: e.target.value })}
              required
            />
            <Input
              label="Mobile Number *"
              placeholder="+91 98765 43210"
              value={addForm.borrowerMobile}
              onChange={(e) => setAddForm({ ...addForm, borrowerMobile: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email Address *"
            type="email"
            placeholder="client@example.com"
            value={addForm.borrowerEmail}
            onChange={(e) => setAddForm({ ...addForm, borrowerEmail: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Principal Amount (₹) *"
              type="number"
              min={1000}
              step={1000}
              value={addForm.principalAmount}
              onChange={(e) => setAddForm({ ...addForm, principalAmount: Number(e.target.value) })}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Tenure (Months) *
              </label>
              <select
                value={addForm.tenureMonths}
                onChange={(e) => handleTenureChange(Number(e.target.value))}
                className="flex h-11 w-full rounded-lg border border-charcoal-700 bg-charcoal-900 px-3 py-2 text-sm text-foreground focus:border-gold-500/80 focus:outline-none"
              >
                <option value={1}>1 Month (13.5%)</option>
                <option value={2}>2 Months (13.5%)</option>
                <option value={3}>3 Months (13.5%)</option>
                <option value={4}>4 Months (14.7%)</option>
                <option value={5}>5 Months (14.7% - Max)</option>
              </select>
            </div>

            <Input
              label="Flat Rate (%) *"
              type="number"
              step={0.1}
              value={addForm.interestRateAnnual}
              onChange={(e) => setAddForm({ ...addForm, interestRateAnnual: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Disbursement Date"
              type="date"
              value={addForm.disbursementDate}
              onChange={(e) => setAddForm({ ...addForm, disbursementDate: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Initial Account Status
              </label>
              <select
                value={addForm.status}
                onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                className="flex h-11 w-full rounded-lg border border-charcoal-700 bg-charcoal-900 px-3 py-2 text-sm text-foreground focus:border-gold-500/80 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (Disbursed & Servicing)</option>
                <option value="APPROVED">APPROVED (Pending Disbursement)</option>
                <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-charcoal-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="luxury"
              size="sm"
              isLoading={isSubmittingAdd}
              className="font-bold shadow-gold-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Create Client Loan Account</span>
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT LOAN MODAL */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Loan Account [${selectedLoan?.loanId}]`}
        description="Modify client details, principal balance, or account status."
      >
        <form onSubmit={handleUpdateLoan} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Borrower Full Name"
              value={editForm.borrowerName}
              onChange={(e) => setEditForm({ ...editForm, borrowerName: e.target.value })}
              required
            />
            <Input
              label="Mobile Number"
              value={editForm.borrowerMobile}
              onChange={(e) => setEditForm({ ...editForm, borrowerMobile: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={editForm.borrowerEmail}
            onChange={(e) => setEditForm({ ...editForm, borrowerEmail: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sanctioned Principal (₹)"
              type="number"
              value={editForm.principalAmount}
              onChange={(e) => setEditForm({ ...editForm, principalAmount: Number(e.target.value) })}
              required
            />
            <Input
              label="Flat Rate (%)"
              type="number"
              step={0.1}
              value={editForm.interestRateAnnual}
              onChange={(e) => setEditForm({ ...editForm, interestRateAnnual: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Paid So Far (₹)"
              type="number"
              value={editForm.totalPaid}
              onChange={(e) => setEditForm({ ...editForm, totalPaid: Number(e.target.value) })}
            />
            <Input
              label="Outstanding Balance (₹)"
              type="number"
              value={editForm.outstandingBalance}
              onChange={(e) => setEditForm({ ...editForm, outstandingBalance: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
              Loan Account Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LoanStatus })}
              className="flex h-11 w-full rounded-lg border border-charcoal-700 bg-charcoal-900 px-3 py-2 text-sm text-foreground focus:border-gold-500/80 focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
              <option value="PAID">PAID (Settled)</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="DEFAULTED">DEFAULTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-charcoal-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingEdit}
              className="font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE LOAN CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Permanently Remove Loan Account?"
        description="Are you sure you want to delete this loan record from the ledger?"
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-2">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Permanent Deletion Warning</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete Loan Account{" "}
              <strong className="text-white font-mono">{selectedLoan?.loanId}</strong> (Borrower:{" "}
              <strong className="text-white">{selectedLoan?.borrowerName}</strong>, Principal:{" "}
              <strong className="text-gold-400">{formatCurrency(selectedLoan?.principalAmount || 0)}</strong>).
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-charcoal-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteLoan}
              isLoading={isSubmittingDelete}
              className="font-bold"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span>Confirm Permanent Deletion</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
