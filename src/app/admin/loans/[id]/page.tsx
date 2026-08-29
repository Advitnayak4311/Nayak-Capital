"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LoanRecord } from "@/lib/models/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Landmark,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  DollarSign,
  Receipt,
  FileCheck2,
  AlertCircle,
  CreditCard,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = (params.id as string) || "";
  const { toast } = useToast();

  const [loan, setLoan] = React.useState<LoanRecord | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = React.useState<number | "">("");
  const [paymentDate, setPaymentDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = React.useState("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = React.useState("");
  const [paymentNotes, setPaymentNotes] = React.useState("");

  const fetchLoan = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/repayments`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLoan(data.loan);
        // Pre-fill next expected installment amount
        if (data.loan.schedule) {
          const nextPending = data.loan.schedule.find((s: any) => s.status !== "PAID");
          if (nextPending) {
            setPaymentAmount(nextPending.expectedAmount - nextPending.paidAmount);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load loan record:", err);
    } finally {
      setIsLoading(false);
    }
  }, [loanId]);

  React.useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0 || !transactionRef.trim()) {
      toast({
        title: "Missing Details",
        description: "Please enter a valid amount and transaction reference.",
        type: "error",
      });
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/repayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          paymentDate,
          paymentMethod,
          transactionReference: transactionRef,
          notes: paymentNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record payment");
      }

      toast({
        title: "Payment Recorded",
        description: `Installment of ${formatCurrency(paymentAmount)} credited to loan ledger.`,
        type: "success",
      });

      setLoan(data.loan);
      setIsRecordModalOpen(false);
      setTransactionRef("");
      setPaymentNotes("");
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeleteLoan = async () => {
    if (!loan) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/loans/${loan.loanId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete loan.");
      }

      toast({
        title: "Loan Record Deleted",
        description: `Loan ${loan.loanId} removed permanently from portfolio.`,
        type: "success",
      });

      router.push("/admin/loans");
    } catch (err: any) {
      toast({
        title: "Deletion Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Loading Loan Ledger & Amortization Schedule...
        </p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Loan Account Not Found</h2>
        <Link href="/admin/loans">
          <Button variant="secondary" size="md">
            Return to Loans Portfolio
          </Button>
        </Link>
      </div>
    );
  }

  const recoveryProgress =
    loan.totalPayable > 0 ? (loan.totalPaid / loan.totalPayable) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/admin/loans">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400 hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Loan Portfolio</span>
              </Button>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-xs font-bold text-gold-300">{loan.loanId}</span>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <h1 className="text-2xl font-serif font-bold text-white">
              {loan.borrowerName}
            </h1>
            <Badge status={loan.status} />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs text-red-400 border-red-500/30 hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            <span>Remove Loan</span>
          </Button>

          <Button
            variant="luxury"
            size="md"
            onClick={() => setIsRecordModalOpen(true)}
            className="text-xs uppercase tracking-wider font-bold shadow-gold-md"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Record Repayment</span>
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-1.5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sanctioned Principal
          </span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {formatCurrency(loan.principalAmount)}
          </div>
          <p className="text-[11px] text-slate-500">{loan.tenureMonths} Mo @ {loan.interestRateAnnual}% p.a.</p>
        </div>

        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-1.5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Contractual Payable
          </span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-gold-300">
            {formatCurrency(loan.totalPayable)}
          </div>
          <p className="text-[11px] text-slate-500">Includes interest accruals</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-charcoal-900/90 p-5 space-y-1.5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Total Recovered to Date
          </span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
            {formatCurrency(loan.totalPaid)}
          </div>
          <div className="w-full bg-charcoal-800 rounded-full h-1.5 mt-2">
            <div
              style={{ width: `${Math.min(recoveryProgress, 100)}%` }}
              className="bg-emerald-500 h-1.5 rounded-full"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-1.5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Outstanding Balance
          </span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-gold-400">
            {formatCurrency(loan.outstandingBalance)}
          </div>
          <p className="text-[11px] text-slate-500">Next Due: {formatDate(loan.nextDueDate)}</p>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-white">
              Amortization Repayment Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled installment dates and reconciliation status.
            </p>
          </div>
          <span className="text-xs font-mono text-gold-400">
            {loan.repaymentFrequency} Installments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3.5 font-semibold">Inst. #</th>
                <th className="pb-3.5 font-semibold">Due Date</th>
                <th className="pb-3.5 font-semibold">Expected Installment</th>
                <th className="pb-3.5 font-semibold">Principal</th>
                <th className="pb-3.5 font-semibold">Interest</th>
                <th className="pb-3.5 font-semibold">Paid Amount</th>
                <th className="pb-3.5 font-semibold">Settlement Date</th>
                <th className="pb-3.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 font-mono">
              {loan.schedule.map((inst) => (
                <tr key={inst.installmentNumber} className="hover:bg-charcoal-850/60 transition-colors">
                  <td className="py-3 font-bold text-slate-400 font-sans">
                    #{String(inst.installmentNumber).padStart(2, "0")}
                  </td>
                  <td className="py-3 text-slate-300 font-sans">{formatDate(inst.dueDate)}</td>
                  <td className="py-3 font-bold text-white">
                    {formatCurrency(inst.expectedAmount)}
                  </td>
                  <td className="py-3 text-slate-400">
                    {formatCurrency(inst.principalComponent)}
                  </td>
                  <td className="py-3 text-slate-400">
                    {formatCurrency(inst.interestComponent)}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">
                    {formatCurrency(inst.paidAmount)}
                  </td>
                  <td className="py-3 text-slate-400 font-sans">
                    {inst.paidDate ? formatDate(inst.paidDate) : "—"}
                  </td>
                  <td className="py-3 text-right font-sans">
                    <Badge status={inst.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recorded Payment Transactions Stream */}
      <div className="rounded-3xl border border-charcoal-750 bg-charcoal-900/90 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-gold-400">
          <Receipt className="h-5 w-5" />
          <h2 className="text-lg font-serif font-bold text-white">
            Recorded Repayment Receipts ({loan.repayments.length})
          </h2>
        </div>

        {loan.repayments.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No repayment credits recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Receipt Number</th>
                  <th className="pb-3 font-semibold">Amount Credited</th>
                  <th className="pb-3 font-semibold">Payment Channel</th>
                  <th className="pb-3 font-semibold">Bank Reference / UTR</th>
                  <th className="pb-3 font-semibold">Recorded Date</th>
                  <th className="pb-3 font-semibold">Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800/60">
                {loan.repayments.map((rep) => (
                  <tr key={rep.id} className="hover:bg-charcoal-850/60">
                    <td className="py-3 font-mono font-bold text-gold-300">
                      {rep.receiptId}
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      {formatCurrency(rep.amount)}
                    </td>
                    <td className="py-3 text-slate-300">{rep.paymentMethod}</td>
                    <td className="py-3 font-mono text-slate-400">{rep.transactionReference}</td>
                    <td className="py-3 text-slate-400">{formatDateTime(rep.paymentDate)}</td>
                    <td className="py-3 text-slate-400">{rep.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Repayment Dialog Modal */}
      <Dialog
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Repayment Installment"
        description={`Credit funds to Loan Account ${loan.loanId}`}
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Payment Amount (₹) *"
            type="number"
            min={1}
            step={100}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            prefixIcon={<DollarSign className="h-4 w-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Channel *"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: "BANK_TRANSFER", label: "Bank Transfer (NEFT/RTGS/IMPS)" },
                { value: "UPI", label: "UPI Direct Settlement" },
                { value: "CHEQUE", label: "Commercial Cheque" },
                { value: "AUTO_DEBIT", label: "NACH / Electronic Mandate" },
                { value: "CASH", label: "Direct Counter Cash" },
              ]}
            />

            <Input
              label="Payment Settlement Date *"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Transaction Reference / UTR Number *"
            placeholder="e.g. AXIS-IMPS-981273461"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            required
          />

          <Textarea
            label="Internal Notes / Remark"
            placeholder="e.g. Monthly installment 2 cleared via bank transfer..."
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end space-x-3 pt-3 border-t border-charcoal-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsRecordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="luxury"
              size="md"
              isLoading={isSubmittingPayment}
              className="text-xs uppercase tracking-wider font-bold"
            >
              Commit Payment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
              <strong className="text-white font-mono">{loan?.loanId}</strong> (Borrower:{" "}
              <strong className="text-white">{loan?.borrowerName}</strong>, Principal:{" "}
              <strong className="text-gold-400">{formatCurrency(loan?.principalAmount || 0)}</strong>).
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
              isLoading={isDeleting}
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
