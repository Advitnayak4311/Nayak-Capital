import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = dbStore.getLoanById(params.id);
    if (!loan) {
      return NextResponse.json({ success: false, error: "Loan account not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, loan });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updatedLoan = dbStore.updateLoan(params.id, body);

    if (!updatedLoan) {
      return NextResponse.json({ success: false, error: "Loan account not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Loan record updated successfully.",
      loan: updatedLoan,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = dbStore.deleteLoan(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Loan account not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Loan account successfully deleted from portfolio.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
