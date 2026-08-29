import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { recordPaymentSchema } from "@/lib/validation/authSchema";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = dbStore.getLoanById(params.id);
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Loan record not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, loan });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parseResult = recordPaymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payment payload.", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { amount, paymentDate, paymentMethod, transactionReference, notes } = parseResult.data;

    const updated = dbStore.recordRepayment(params.id, {
      amount,
      paymentDate,
      paymentMethod,
      transactionReference,
      recordedBy: "Credit Operations Desk",
      notes,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Loan record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Repayment recorded and ledger reconciled.",
      loan: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
