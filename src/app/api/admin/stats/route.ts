import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const applications = dbStore.getApplications();
    const loans = dbStore.getLoans();

    const totalApplications = applications.length;
    const pendingReview = applications.filter(
      (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
    ).length;
    const approvedCount = applications.filter(
      (a) => a.status === "APPROVED" || a.status === "AGREEMENT_SIGNED" || a.status === "ACTIVE"
    ).length;
    const activeLoans = loans.filter((l) => l.status === "ACTIVE" || l.status === "PARTIALLY_PAID").length;
    const completedLoans = loans.filter((l) => l.status === "PAID" || l.status === "CLOSED").length;
    const overdueLoans = loans.filter((l) => l.status === "OVERDUE" || l.status === "DEFAULTED").length;

    const totalDisbursed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
    const totalCollected = loans.reduce((sum, l) => sum + l.totalPaid, 0);
    const totalOutstanding = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalApplications,
        pendingReview,
        approvedCount,
        activeLoans,
        completedLoans,
        overdueLoans,
        totalDisbursed,
        totalCollected,
        totalOutstanding,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
