import { jsPDF } from "jspdf";
import { LoanApplication } from "../models/types";
import { formatDate, formatDateTime, calculateEMI } from "../utils";

/**
 * Clean ASCII Currency Formatter for PDF generation
 * Avoids Unicode Rupee symbol (₹) encoding corruption in standard PDF fonts
 */
function formatPdfCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "Rs. 0";
  }
  const num = Number(amount);
  return "Rs. " + num.toLocaleString("en-IN");
}

export function generateBorrowerDeclarationPdfBuffer(app: LoanApplication): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Helper to add clean professional page header
  const addPageHeader = (pageNum: number) => {
    // Header background banner
    doc.setFillColor(11, 14, 20); // Dark luxury Charcoal
    doc.rect(margin, margin - 4, pageWidth - margin * 2, 20, "F");

    doc.setTextColor(212, 175, 55); // Nayak Gold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("NAYAK CAPITAL", margin + 4, margin + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("TRUSTED LOANS. STRONGER FUTURES.", margin + 4, margin + 8.5);
    doc.text("Direct Personal Lending & Credit Facilities", margin + 4, margin + 12.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(212, 175, 55);
    doc.text(`REF: ${app.applicationId}`, pageWidth - margin - 4, margin + 4, { align: "right" });
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formatDate(app.createdAt)}`, pageWidth - margin - 4, margin + 8.5, { align: "right" });
    doc.text(`Page ${pageNum}`, pageWidth - margin - 4, margin + 12.5, { align: "right" });

    y = margin + 22;
  };

  // Helper to check page overflow
  const checkPageBreak = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin - 10) {
      doc.addPage();
      addPageHeader(doc.getNumberOfPages());
    }
  };

  // Start Page 1
  addPageHeader(1);

  // Document Title Banner
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 9, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, pageWidth - margin * 2, 9, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(
    "BORROWER CONSENT, UNDERTAKING & STATUTORY DECLARATION",
    pageWidth / 2,
    y + 6,
    { align: "center" }
  );
  y += 13;

  // Section 1: Borrower Information & Loan Summary
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("1. APPLICANT IDENTIFICATION & SANCTION REQUEST SUMMARY", margin + 3, y + 4.2);
  y += 8;

  const col1 = margin + 2;
  const col2 = margin + 44;
  const col3 = margin + 98;
  const col4 = margin + 142;
  const rowH = 5.2;

  const drawRow = (label1: string, val1: string, label2: string, val2: string) => {
    checkPageBreak(rowH + 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label1, col1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(val1 || "N/A", col2, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(label2, col3, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(val2 || "N/A", col4, y);
    y += rowH;
  };

  const calculatedEmi =
    app.loan.estimatedEMI ||
    calculateEMI(
      app.loan.amount,
      app.loan.proposedInterestRateAnnual || (app.loan.tenureMonths <= 3 ? 13.5 : 14.7),
      app.loan.tenureMonths
    ).emi;

  drawRow("Full Legal Name:", app.borrower.fullName, "Application ID:", app.applicationId);
  drawRow("Date of Birth:", app.borrower.dob, "Mobile Number:", app.borrower.mobile);
  drawRow("Father / Spouse:", app.borrower.fatherOrSpouseName, "Email Address:", app.borrower.email);
  drawRow("PAN Card Number:", app.kyc.panNumber || "N/A", "Identity Proof:", `${app.kyc.documentType} (${app.kyc.documentNumber})`);
  drawRow("Occupation:", `${app.income?.occupationType || "SALARIED"} - ${app.borrower.occupation}`, "Employer / Business:", app.borrower.employerOrBusinessName || "Self");
  drawRow("Monthly Income:", formatPdfCurrency(app.income?.monthlyIncome || 0), "Existing Obligations:", formatPdfCurrency(app.income?.existingLoanObligationsMonthly || 0));
  drawRow("Requested Principal:", formatPdfCurrency(app.loan.amount), "Tenure Requested:", `${app.loan.tenureMonths} Months`);
  drawRow("Applicable Rate:", `${app.loan.proposedInterestRateAnnual || 13.5}% p.a. Fixed`, "Estimated EMI:", formatPdfCurrency(calculatedEmi));
  drawRow("Disbursement Mode:", app.income?.disbursementMode || "BANK_TRANSFER", "Purpose of Loan:", app.loan.purpose || "Personal Finance");
  drawRow("Current Address:", (app.borrower.currentAddress || "").substring(0, 42), "Permanent Address:", (app.borrower.permanentAddress || app.borrower.currentAddress || "").substring(0, 42));

  y += 4;

  // Section 2: Statutory Declaration & Covenants
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("2. BORROWER COVENANTS, STATUTORY DECLARATION & RECOVERY TERMS", margin + 3, y + 4.2);
  y += 8;

  const declarationPoints = [
    {
      num: "1.",
      title: "Truthfulness & Accuracy of Disclosures:",
      text: "I confirm that all information, personal disclosures, financial data, and documents uploaded by me are true, accurate, valid, and complete in all respects to the best of my knowledge.",
    },
    {
      num: "2.",
      title: "Verification & Underwriting Authorization:",
      text: "I explicitly authorize Nayak Capital, NFS & Lending, and their designated officers to verify and authenticate the information and documents provided for the purpose of credit appraisal, administration, and maintaining this loan relationship.",
    },
    {
      num: "3.",
      title: "Sanction Terms & Pre-Disbursement Conditions:",
      text: "I understand and agree that the loan, if approved, shall strictly be subject to the applicable loan terms, repayment schedule, charges, and conditions communicated to me in the loan agreement or related documents.",
    },
    {
      num: "4.",
      title: "Strict Repayment Obligation:",
      text: "I acknowledge full personal responsibility for making repayments on or before the agreed due dates without deduction, set-off, or delay.",
    },
    {
      num: "5.",
      title: "Late Payment Penal Charges & Consequences:",
      text: "I understand that if I fail to pay the money on time, extra charges and penal interest on the entire outstanding amount will be imposed immediately until full liquidation.",
    },
    {
      num: "6.",
      title: "Asset Confiscation, Possession & Legal Recovery Covenant:",
      text: "In the event of default, non-payment, or breach of repayment terms, Nayak Capital / NFS & Lending reserves the explicit right to initiate legal recovery proceedings, take possession of, attach, or confiscate any items, assets, or properties belonging to the borrower without additional consent, to the extent permitted under applicable law.",
    },
  ];

  doc.setFontSize(8);
  declarationPoints.forEach((pt) => {
    checkPageBreak(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${pt.num} ${pt.title}`, margin + 2, y);
    y += 3.8;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(pt.text, pageWidth - margin * 2 - 6);
    doc.text(splitText, margin + 5, y);
    y += splitText.length * 3.6 + 2.2;
  });

  // Section 3: Digital Execution & Signature Block
  checkPageBreak(42);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 36, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, pageWidth - margin * 2, 36, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber/Gold
  doc.text("ELECTRONIC EXECUTION & LEGAL SIGNATURE", margin + 4, y + 4.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Signed via Nayak Capital Electronic Verification Protocol [Audit IP: ${app.consent?.signerIpAddress || "127.0.0.1"}]`,
    margin + 4,
    y + 9
  );

  // Render drawn signature
  const signerName = app.consent?.signerFullName || app.borrower.fullName;
  if (app.consent?.signatureData && app.consent.signatureData.startsWith("data:image")) {
    try {
      doc.addImage(app.consent.signatureData, "PNG", margin + 4, y + 10.5, 45, 14);
    } catch {
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(signerName, margin + 6, y + 18);
    }
  } else {
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(app.consent?.signatureData || signerName, margin + 6, y + 18);
  }

  // Printed Legal Name Below Signature (Compulsory requirement)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Authorized Signatory: ${signerName}`, margin + 4, y + 27.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Signed At: ${formatDateTime(app.consent?.consentTimestamp || app.createdAt)} | Status: BINDING & VERIFIED`,
    margin + 4,
    y + 31.5
  );

  // Bottom Notice
  y += 40;
  checkPageBreak(10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Nayak Capital Lenders | Direct Lending Desk: +91 9380810711 | Email: nayakloanservices@gmail.com",
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
