import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/emailService";
import { dbStore } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, mobile, inquiryType, message } = body;

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Please provide your name, email, and message." },
        { status: 400 }
      );
    }

    const inquiryLabel =
      inquiryType === "PERSONAL_LOAN_INQUIRY"
        ? "Personal Loan Inquiry"
        : inquiryType === "APPLICATION_SUPPORT"
        ? "Existing Application Support"
        : "General Inquiry";

    // 1. Dispatch Email to Admin Desks (nayakloanservices@gmail.com & advithnayak1118@gmail.com)
    const adminRecipients = [
      "nayakloanservices@gmail.com",
      "advithnayak1118@gmail.com",
    ].filter((val, index, self) => self.indexOf(val) === index);

    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #07090E; color: #F8FAFC; padding: 24px; border-radius: 10px; border: 1px solid #D4AF37; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #D4AF37; margin: 0; font-size: 18px;">NEW CONTACT DESK INQUIRY</h2>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 4px;">Incoming customer inquiry from Nayak Capital website</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #94A3B8; width: 35%; font-size: 13px;">Full Name:</td>
            <td style="padding: 8px 0; color: #FFFFFF; font-weight: bold; font-size: 14px;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94A3B8; font-size: 13px;">Email Address:</td>
            <td style="padding: 8px 0; color: #38BDF8; font-size: 13px;"><a href="mailto:${email}" style="color: #38BDF8;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94A3B8; font-size: 13px;">Mobile Contact:</td>
            <td style="padding: 8px 0; color: #FFFFFF; font-size: 13px;"><a href="tel:${mobile || ""}" style="color: #38BDF8;">${mobile || "Not provided"}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94A3B8; font-size: 13px;">Inquiry Category:</td>
            <td style="padding: 8px 0; color: #D4AF37; font-weight: bold; font-size: 13px;">${inquiryLabel}</td>
          </tr>
        </table>

        <div style="background: #10141D; border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 16px; margin: 16px 0;">
          <strong style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message Content:</strong>
          <p style="color: #E2E8F0; font-size: 14px; line-height: 1.6; margin: 8px 0 0 0; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px; margin-top: 20px;">
          Nayak Capital &bull; Contact Desk Dispatch &bull; ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
        </div>
      </div>
    `;

    for (const recipient of adminRecipients) {
      await sendEmail({
        to: recipient,
        subject: `[CONTACT INQUIRY] ${inquiryLabel} from ${fullName}`,
        html: adminHtml,
        emailType: "CONTACT_FORM_ADMIN_ALERT",
      });
    }

    // 2. Dispatch Confirmation Email to the Customer
    const customerHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #07090E; color: #F8FAFC; padding: 24px; border-radius: 10px; border: 1px solid rgba(212,175,55,0.3); max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #D4AF37; margin: 0; letter-spacing: 2px;">NAYAK CAPITAL</h2>
          <p style="color: #94A3B8; font-size: 11px; margin-top: 4px;">TRUSTED LOANS. STRONGER FUTURES.</p>
        </div>

        <h3 style="color: #FFFFFF; margin-top: 0;">Dear ${fullName},</h3>
        <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">
          Thank you for contacting Nayak Capital. We have received your inquiry regarding <strong>${inquiryLabel}</strong>.
        </p>
        <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">
          One of our personal loan officers will review your message and connect with you at <strong>${mobile || email}</strong> shortly.
        </p>

        <div style="background: #10141D; border-left: 3px solid #D4AF37; padding: 12px 16px; font-size: 13px; color: #E2E8F0; margin: 20px 0;">
          <strong>Direct Assistance:</strong> You may also reach our Personal Loan Desk directly at <a href="tel:+919380810711" style="color: #38BDF8;">+91 9380810711</a> during standard operating hours (09:00 – 19:00 IST).
        </div>

        <div style="font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px; margin-top: 24px;">
          Nayak Capital Lenders &bull; Contact Desk &bull; nayakloanservices@gmail.com
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `Nayak Capital – We Received Your Inquiry`,
      html: customerHtml,
      emailType: "CONTACT_FORM_CUSTOMER_RECEIPT",
    });

    // 3. Log into Audit Trail
    dbStore.addAuditLog({
      actorId: "customer",
      actorName: fullName,
      actorRole: "BORROWER",
      action: "CONTACT_MESSAGE_SENT",
      targetId: email,
      targetType: "USER",
      metadata: { mobile, category: inquiryLabel },
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been transmitted to our loan desk successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
