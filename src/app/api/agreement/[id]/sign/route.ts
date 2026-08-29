import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { sendAgreementSignedNotification } from "@/lib/email/emailService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { signatureType, signatureData, signedIp } = body;

    if (!signatureData) {
      return NextResponse.json(
        { success: false, error: "Signature data is required to execute agreement." },
        { status: 400 }
      );
    }

    const updated = dbStore.signAgreement(params.id, {
      signatureType: signatureType || "TYPED",
      signatureData,
      signedIp: signedIp || req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Agreement could not be found or executed." },
        { status: 404 }
      );
    }

    // Trigger notification email asynchronously
    sendAgreementSignedNotification(updated).catch((e) => {
      console.warn("Signed agreement email notification warning:", e);
    });

    return NextResponse.json({
      success: true,
      message: "Personal Loan Agreement executed successfully.",
      agreement: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
