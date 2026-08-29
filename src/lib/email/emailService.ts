import nodemailer from "nodemailer";
import { dbStore } from "@/lib/db/store";
import {
  getApplicationSubmittedEmail,
  getComprehensiveAdminApplicationDossier,
  getAgreementSignedEmail,
} from "./templates";
import { LoanApplication, PersonalLoanAgreement, UploadedDocument } from "@/lib/models/types";
import { generateBorrowerDeclarationPdfBuffer } from "@/lib/pdf/generateDeclarationPdf";

export interface EmailAttachmentItem {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export function getTransporter(): nodemailer.Transporter | null {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").replace(/^["']|["']$/g, "").trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || "nayakloanservices@gmail.com").replace(/^["']|["']$/g, "").trim();
  const pass = (process.env.SMTP_PASS || "").replace(/^["']|["']$/g, "").replace(/\s+/g, "").trim();

  if (user && pass) {
    if (host.includes("gmail") || user.endsWith("@gmail.com")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
}

export async function verifySmtpConnection(): Promise<{ connected: boolean; message: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      connected: false,
      message: "SMTP is in Simulation Mode (SMTP_USER or SMTP_PASS not set in environment).",
    };
  }
  try {
    await transporter.verify();
    return { connected: true, message: "SMTP connection verified and ready to dispatch live emails." };
  } catch (err: any) {
    return { connected: false, message: err.message || "Failed to connect to SMTP server." };
  }
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  emailType: string;
  applicationId?: string;
  attachments?: EmailAttachmentItem[];
}): Promise<{ success: boolean; simulated: boolean; error?: string; messageId?: string }> {
  const emailFrom = process.env.EMAIL_FROM || "Nayak Capital Lenders <nayakloanservices@gmail.com>";
  const transporter = getTransporter();
  const recipientStr = Array.isArray(options.to) ? options.to.join(", ") : options.to;

  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      dbStore.addEmailLog({
        recipient: recipientStr,
        emailType: options.emailType,
        subject: options.subject,
        applicationId: options.applicationId,
        status: "SENT",
        providerMessageId: info.messageId,
      });

      return { success: true, simulated: false, messageId: info.messageId };
    } else {
      // Local dev simulation mode
      dbStore.addEmailLog({
        recipient: recipientStr,
        emailType: options.emailType,
        subject: options.subject,
        applicationId: options.applicationId,
        status: "SIMULATED",
      });

      return { success: true, simulated: true };
    }
  } catch (err: any) {
    dbStore.addEmailLog({
      recipient: recipientStr,
      emailType: options.emailType,
      subject: options.subject,
      applicationId: options.applicationId,
      status: "FAILED",
      errorMessage: err.message,
    });

    return { success: false, simulated: false, error: err.message };
  }
}

function parseDocumentAttachment(doc: UploadedDocument): EmailAttachmentItem | null {
  try {
    if (doc.fileUrl && doc.fileUrl.startsWith("data:")) {
      const matches = doc.fileUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return {
          filename: doc.fileName || `${doc.docType.toLowerCase()}.${doc.fileMimeType.split("/")[1] || "pdf"}`,
          content: Buffer.from(matches[2], "base64"),
          contentType: matches[1] || doc.fileMimeType,
        };
      }
    }
  } catch (err) {
    console.warn("Failed to parse document attachment:", doc.fileName, err);
  }
  return null;
}

export async function sendApplicationSubmittedNotifications(app: LoanApplication) {
  // 1. Generate official Signed Borrower Consent & Declaration PDF
  let declarationPdfBuffer: Buffer | null = null;
  try {
    declarationPdfBuffer = generateBorrowerDeclarationPdfBuffer(app);
  } catch (pdfErr) {
    console.error("Error generating borrower declaration PDF buffer:", pdfErr);
  }

  const pdfAttachment: EmailAttachmentItem[] = declarationPdfBuffer
    ? [
        {
          filename: `Signed_Declaration_${app.applicationId}.pdf`,
          content: declarationPdfBuffer,
          contentType: "application/pdf",
        },
      ]
    : [];

  // 2. Prepare all uploaded document attachments for admin dossier
  const docAttachments: EmailAttachmentItem[] = [];
  if (app.documents && app.documents.length > 0) {
    app.documents.forEach((doc) => {
      const att = parseDocumentAttachment(doc);
      if (att) docAttachments.push(att);
    });
  }

  // Combined attachments for Admin (Declaration PDF + Live Photo + PAN Card + ID Proof + Address Proof)
  const adminAttachments = [...pdfAttachment, ...docAttachments];

  // 3. Dispatch to Customer (Borrower receives confirmation + Signed Declaration PDF)
  const customerEmail = getApplicationSubmittedEmail(app);
  try {
    await sendEmail({
      to: app.borrower.email,
      subject: customerEmail.subject,
      html: customerEmail.html,
      emailType: "APPLICATION_SUBMITTED_CUSTOMER",
      applicationId: app.applicationId,
      attachments: pdfAttachment,
    });
  } catch (err) {
    console.error("Failed to dispatch customer receipt email:", err);
  }

  // 4. Dispatch to Admin Personal Email (advithnayak1118@gmail.com) & Desk (nayakloanservices@gmail.com)
  const adminRecipients = [
    "advithnayak1118@gmail.com",
    process.env.ADMIN_NOTIFICATION_EMAIL || "nayakloanservices@gmail.com",
  ].filter((email, index, self) => self.indexOf(email) === index); // Unique list

  const adminDossier = getComprehensiveAdminApplicationDossier(app);
  for (const recipient of adminRecipients) {
    try {
      await sendEmail({
        to: recipient,
        subject: adminDossier.subject,
        html: adminDossier.html,
        emailType: "ADMIN_FULL_APPLICATION_DOSSIER",
        applicationId: app.applicationId,
        attachments: adminAttachments,
      });
    } catch (err) {
      console.error(`Failed to dispatch admin dossier to ${recipient}:`, err);
    }
  }
}

export async function sendAgreementSignedNotification(agreement: PersonalLoanAgreement) {
  const email = getAgreementSignedEmail(agreement);
  await sendEmail({
    to: agreement.borrowerEmail,
    subject: email.subject,
    html: email.html,
    emailType: "AGREEMENT_SIGNED",
    applicationId: agreement.applicationId,
  });
}
