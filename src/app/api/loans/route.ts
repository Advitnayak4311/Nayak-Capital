import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const loans = dbStore.getLoans();
    return NextResponse.json({ success: true, count: loans.length, loans });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.borrowerName || !body.principalAmount || !body.tenureMonths) {
      return NextResponse.json(
        { success: false, error: "Borrower name, principal amount, and tenure are required." },
        { status: 400 }
      );
    }

    const newLoan = dbStore.addManualLoan({
      borrowerName: body.borrowerName.trim(),
      borrowerMobile: body.borrowerMobile?.trim() || "+91 98000 00000",
      borrowerEmail: body.borrowerEmail?.trim() || "client@nayakcapital.com",
      principalAmount: Number(body.principalAmount),
      interestRateAnnual: Number(body.interestRateAnnual) || (Number(body.tenureMonths) <= 3 ? 13.5 : 14.7),
      tenureMonths: Math.min(5, Math.max(1, Number(body.tenureMonths))),
      disbursementDate: body.disbursementDate || new Date().toISOString().split("T")[0],
      repaymentFrequency: body.repaymentFrequency || "MONTHLY",
      status: body.status || "ACTIVE",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Loan record successfully created and active in ledger.",
        loan: newLoan,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
