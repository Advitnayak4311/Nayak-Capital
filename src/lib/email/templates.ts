import { LoanApplication, PersonalLoanAgreement } from "@/lib/models/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export function getApplicationSubmittedEmail(app: LoanApplication): { subject: string; html: string } {
  const subject = `Nayak Capital – Loan Application Received [${app.applicationId}]`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090E; color: #F8FAFC; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #10141D; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; margin: 0; }
        .tagline { font-size: 11px; letter-spacing: 1.5px; color: #94A3B8; margin-top: 4px; }
        .badge { display: inline-block; background: rgba(212, 175, 55, 0.15); color: #D4AF37; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 16px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #161B26; border-radius: 8px; overflow: hidden; }
        .table td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
        .table td.label { color: #94A3B8; width: 40%; }
        .table td.val { color: #FFFFFF; font-weight: 600; }
        .notice { background: rgba(212, 175, 55, 0.08); border-left: 3px solid #D4AF37; padding: 14px 16px; font-size: 13px; color: #E2E8F0; line-height: 1.5; margin: 20px 0; border-radius: 4px; }
        .pdf-box { background: #1E293B; border: 1px solid #38BDF8; padding: 14px 16px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 28px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">NAYAK CAPITAL</div>
          <div class="tagline">TRUSTED LOANS. STRONGER FUTURES.</div>
        </div>
        
        <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">Dear ${app.borrower.fullName},</h2>
        <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">
          Thank you for applying with Nayak Capital. Your credit application has been securely recorded and assigned to our Senior Underwriting Committee for appraisal.
        </p>

        <div style="text-align: center;">
          <div class="badge">Application Reference: ${app.applicationId}</div>
        </div>

        <table class="table">
          <tr>
            <td class="label">Product Category</td>
            <td class="val">${app.loan.productName}</td>
          </tr>
          <tr>
            <td class="label">Requested Amount</td>
            <td class="val" style="color: #D4AF37;">${formatCurrency(app.loan.amount)}</td>
          </tr>
          <tr>
            <td class="label">Preferred Tenure</td>
            <td class="val">${app.loan.tenureMonths} Months</td>
          </tr>
          <tr>
            <td class="label">Applicable Rate</td>
            <td class="val" style="color: #34D399;">${app.loan.proposedInterestRateAnnual}% p.a. Fixed</td>
          </tr>
          <tr>
            <td class="label">Estimated EMI</td>
            <td class="val">${formatCurrency(app.loan.estimatedEMI || 0)} / month</td>
          </tr>
          <tr>
            <td class="label">Application Status</td>
            <td class="val" style="color: #38BDF8;">SUBMITTED (Under Appraisal)</td>
          </tr>
        </table>

        <div class="pdf-box">
          <strong style="color: #38BDF8; font-size: 14px;">📄 Attached: Your Signed Declaration & Consent Document</strong>
          <p style="color: #94A3B8; font-size: 12px; margin: 6px 0 0 0;">
            A complete PDF copy of your executed Borrower Consent & Statutory Declaration (including digital signature and verification hash) is attached to this email for your official records.
          </p>
        </div>

        <div class="notice">
          <strong>Important Next Steps:</strong><br>
          Our credit appraisal team will evaluate your KYC documents and income disclosures. You may check real-time status at any time on our website using your Application Reference (${app.applicationId}).
        </div>

        <div class="footer">
          Nayak Capital Lenders &bull; Contact: +91 9380810711 &bull; nayakloanservices@gmail.com<br>
          Confidential financial notification intended solely for the named recipient.
        </div>
      </div>
    </body>
    </html>
  `;
  return { subject, html };
}

export function getComprehensiveAdminApplicationDossier(app: LoanApplication): { subject: string; html: string } {
  const subject = `[NEW LOAN DOSSIER] Application ${app.applicationId} — ${app.borrower.fullName} (${formatCurrency(app.loan.amount)})`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #07090E; color: #F8FAFC; margin: 0; padding: 20px; }
        .card { max-width: 680px; margin: 0 auto; background: #10141D; border: 1px solid #D4AF37; border-radius: 12px; padding: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        .header { border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
        .title { color: #D4AF37; font-size: 20px; font-weight: bold; margin: 0; }
        .subtitle { color: #94A3B8; font-size: 12px; margin-top: 4px; }
        .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; color: #D4AF37; margin: 20px 0 8px 0; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 4px; }
        .grid { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .grid td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #1E293B; }
        .grid td.label { color: #94A3B8; width: 35%; font-weight: 500; }
        .grid td.val { color: #F8FAFC; font-weight: 600; }
        .badge { background: rgba(56, 189, 248, 0.15); color: #38BDF8; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .gold-badge { background: rgba(212, 175, 55, 0.2); color: #D4AF37; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: bold; }
        .attachment-box { background: #161B26; border: 1px dashed #D4AF37; border-radius: 8px; padding: 14px; margin-top: 16px; }
        .footer { text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #1E293B; padding-top: 16px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <div class="title">NAYAK CAPITAL — NEW LOAN DOSSIER</div>
            <div class="subtitle">Complete Borrower Submission & Document Dossier</div>
          </div>
          <div style="text-align: right;">
            <div class="gold-badge">${app.applicationId}</div>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">${formatDateTime(app.createdAt)}</div>
          </div>
        </div>

        <div class="section-title">1. Requested Loan & Financial Terms</div>
        <table class="grid">
          <tr>
            <td class="label">Requested Principal:</td>
            <td class="val" style="color: #D4AF37; font-size: 16px;">${formatCurrency(app.loan.amount)}</td>
          </tr>
          <tr>
            <td class="label">Tenure Requested:</td>
            <td class="val">${app.loan.tenureMonths} Months (${app.loan.proposedInterestRateAnnual}% p.a. Fixed)</td>
          </tr>
          <tr>
            <td class="label">Estimated EMI:</td>
            <td class="val">${formatCurrency(app.loan.estimatedEMI || 0)} / month</td>
          </tr>
          <tr>
            <td class="label">Total Payable:</td>
            <td class="val">${formatCurrency(app.loan.estimatedTotalPayable || 0)}</td>
          </tr>
          <tr>
            <td class="label">Disbursement Preference:</td>
            <td class="val">${app.income?.disbursementMode || "BANK_TRANSFER"}</td>
          </tr>
          ${
            app.income?.disbursementMode === "BANK_TRANSFER"
              ? `
              <tr>
                <td class="label">Bank Account:</td>
                <td class="val">${app.income.primaryBankName} — A/C: ${app.income.primaryAccountNumber} (IFSC: ${app.income.ifscCode})</td>
              </tr>
            `
              : ""
          }
          ${
            app.income?.disbursementMode === "UPI"
              ? `
              <tr>
                <td class="label">UPI Handle:</td>
                <td class="val">${app.income.upiId}</td>
              </tr>
            `
              : ""
          }
          ${
            app.income?.disbursementMode === "CASH"
              ? `
              <tr>
                <td class="label">Cash Handover Location:</td>
                <td class="val">${app.income.cashPreferredCity || "Local Branch"} (Contact: ${app.income.cashContactPhone || app.borrower.mobile})</td>
              </tr>
            `
              : ""
          }
          <tr>
            <td class="label">Loan Purpose:</td>
            <td class="val">${app.loan.purpose}</td>
          </tr>
        </table>

        <div class="section-title">2. Borrower Profile & Identity</div>
        <table class="grid">
          <tr>
            <td class="label">Full Legal Name:</td>
            <td class="val">${app.borrower.fullName}</td>
          </tr>
          <tr>
            <td class="label">Date of Birth:</td>
            <td class="val">${app.borrower.dob}</td>
          </tr>
          <tr>
            <td class="label">Father / Spouse Name:</td>
            <td class="val">${app.borrower.fatherOrSpouseName}</td>
          </tr>
          <tr>
            <td class="label">Direct Mobile Number:</td>
            <td class="val"><a href="tel:${app.borrower.mobile}" style="color: #38BDF8;">${app.borrower.mobile}</a></td>
          </tr>
          <tr>
            <td class="label">Email Address:</td>
            <td class="val"><a href="mailto:${app.borrower.email}" style="color: #38BDF8;">${app.borrower.email}</a></td>
          </tr>
          <tr>
            <td class="label">PAN Card Number:</td>
            <td class="val" style="font-family: monospace; color: #D4AF37;">${app.kyc.panNumber || "N/A"}</td>
          </tr>
          <tr>
            <td class="label">Govt Identity Proof:</td>
            <td class="val">${app.kyc.documentType}: ${app.kyc.documentNumber}</td>
          </tr>
          <tr>
            <td class="label">Current Residential Address:</td>
            <td class="val">${app.borrower.currentAddress}</td>
          </tr>
          <tr>
            <td class="label">Permanent Address:</td>
            <td class="val">${app.borrower.permanentAddress || app.borrower.currentAddress}</td>
          </tr>
          <tr>
            <td class="label">Occupation & Employer:</td>
            <td class="val">${app.income?.occupationType || "SALARIED"} &bull; ${app.borrower.occupation} (${app.borrower.employerOrBusinessName || "Self-Employed"})</td>
          </tr>
          <tr>
            <td class="label">Monthly Inflow / Salary:</td>
            <td class="val" style="color: #34D399;">${formatCurrency(app.income?.monthlyIncome || 0)}</td>
          </tr>
          <tr>
            <td class="label">Existing Monthly Obligations:</td>
            <td class="val">${formatCurrency(app.income?.existingLoanObligationsMonthly || 0)}</td>
          </tr>
        </table>

        ${
          app.guarantor?.hasGuarantor
            ? `
          <div class="section-title">3. Guarantor Information</div>
          <table class="grid">
            <tr>
              <td class="label">Guarantor Name:</td>
              <td class="val">${app.guarantor.fullName} (${app.guarantor.relationship})</td>
            </tr>
            <tr>
              <td class="label">Guarantor Mobile:</td>
              <td class="val">${app.guarantor.mobile}</td>
            </tr>
            <tr>
              <td class="label">Guarantor Address:</td>
              <td class="val">${app.guarantor.address}</td>
            </tr>
          </table>
        `
            : ""
        }

        <div class="section-title">4. Statutory Consent & Electronic Signature</div>
        <table class="grid">
          <tr>
            <td class="label">Consent Acknowledged:</td>
            <td class="val" style="color: #34D399;">YES (Full 6-Point Statutory Declaration & Covenants Accepted)</td>
          </tr>
          <tr>
            <td class="label">Signature Type:</td>
            <td class="val">${app.consent?.signatureType || "DIGITAL"}</td>
          </tr>
          <tr>
            <td class="label">Signer Name & IP:</td>
            <td class="val">${app.consent?.signerFullName || app.borrower.fullName} &bull; IP: ${app.consent?.signerIpAddress || "127.0.0.1"}</td>
          </tr>
          <tr>
            <td class="label">Execution Timestamp:</td>
            <td class="val">${formatDateTime(app.consent?.consentTimestamp || app.createdAt)}</td>
          </tr>
        </table>

        <div class="attachment-box">
          <strong style="color: #D4AF37; font-size: 13px;">📎 Attached Dossier Files to this Email (${(app.documents || []).length + 1} Total):</strong>
          <ul style="color: #CBD5E1; font-size: 12px; margin: 8px 0 0 0; padding-left: 20px;">
            <li><strong>Signed_Declaration_${app.applicationId}.pdf</strong> <em>(Official Generated & Digitally Signed PDF)</em></li>
            ${(app.documents || []).map((d) => `<li><strong>${d.fileName}</strong> <em>(${d.docType} &bull; ${(d.fileSize / 1024).toFixed(1)} KB)</em></li>`).join("")}
          </ul>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/applications/${app.applicationId}" style="display: inline-block; background: #D4AF37; color: #07090E; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px;">
            Open Application in Officer Portal &rarr;
          </a>
        </div>

        <div class="footer">
          Nayak Capital Lenders &bull; Restricted Officer Underwriting Stream<br>
          Confidential internal financial transmission.
        </div>
      </div>
    </body>
    </html>
  `;
  return { subject, html };
}

export function getAdminNewApplicationAlert(app: LoanApplication): { subject: string; html: string } {
  return getComprehensiveAdminApplicationDossier(app);
}

export function getAgreementSignedEmail(agreement: PersonalLoanAgreement): { subject: string; html: string } {
  const subject = `Nayak Capital – Personal Loan Agreement Executed [${agreement.agreementId}]`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #07090E; color: #F8FAFC; padding: 24px; }
        .box { max-width: 600px; margin: 0 auto; background: #10141D; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 10px; padding: 28px; }
        .gold { color: #D4AF37; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2 class="gold">Personal Loan Agreement Executed</h2>
        <p>Dear ${agreement.borrowerName},</p>
        <p>Your Personal Loan Agreement (<span class="gold">${agreement.agreementId}</span>) for the sanctioned facility of <span class="gold">${formatCurrency(agreement.principalAmount)}</span> has been digitally signed and validated.</p>
        <p>The document is now locked and archived in our compliance vault. Disbursement is scheduled in accordance with the agreement parameters.</p>
        <p>You may download your complete executed agreement PDF from the customer portal at any time.</p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
        <p style="font-size: 12px; color: #64748B;">Nayak Capital &bull; Institutional Lending Division</p>
      </div>
    </body>
    </html>
  `;
  return { subject, html };
}
