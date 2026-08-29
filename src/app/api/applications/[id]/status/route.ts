import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { ApplicationStatus } from "@/lib/models/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, note, changedBy = "Admin Officer" } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const updated = dbStore.updateApplicationStatus(
      params.id,
      status as ApplicationStatus,
      changedBy,
      note
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      application: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
