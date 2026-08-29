import { NextRequest, NextResponse } from "next/server";
import { sendEmail, verifySmtpConnection } from "@/lib/email/emailService";

export async function GET(req: NextRequest) {
  try {
    const status = await verifySmtpConnection();
    return NextResponse.json({
      success: true,
      ...status,
      config: {
        host: process.env.SMTP_HOST || "Not configured",
        port: process.env.SMTP_PORT || "587",
        user: process.env.SMTP_USER || "Not configured",
        from: process.env.EMAIL_FROM || "nayakloanservices@gmail.com",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { testRecipient } = await req.json();
    const recipient = testRecipient || process.env.ADMIN_NOTIFICATION_EMAIL || "nayakloanservices@gmail.com";

    const result = await sendEmail({
      to: recipient,
      subject: "Nayak Capital – SMTP Notification Engine Test",
      html: `
        <div style="font-family: sans-serif; background: #07090E; color: #F8FAFC; padding: 24px; border-radius: 8px; border: 1px solid #D4AF37;">
          <h2 style="color: #D4AF37; margin-top: 0;">Nayak Capital Notification Test</h2>
          <p>This is a live test notification from your Nayak Capital system.</p>
          <p><strong>Status:</strong> SMTP Connected & Operational</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="border: 0; border-top: 1px solid rgba(212,175,55,0.2); margin: 20px 0;">
          <p style="font-size: 11px; color: #94A3B8;">Nayak Capital &bull; Institutional Lending Division</p>
        </div>
      `,
      emailType: "ADMIN_TEST_EMAIL",
    });

    return NextResponse.json({
      success: result.success,
      simulated: result.simulated,
      message: result.simulated
        ? "Simulated mode: Credentials not configured yet in .env.local"
        : `Test email successfully dispatched to ${recipient}`,
      error: result.error,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
