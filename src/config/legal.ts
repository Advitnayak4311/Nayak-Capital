export const BORROWER_DECLARATION_VERSION = "1.0.0";
export const LOAN_AGREEMENT_TEMPLATE_VERSION = "1.0.0";

/**
 * Borrower Consent & Declaration clauses preserving the structural integrity
 * of the standard lending declaration without inventing unvalidated legal clauses.
 */
export const BORROWER_CONSENT_CLAUSES = [
  {
    id: "accuracy",
    title: "1. Accuracy & Truthfulness of Information",
    content:
      "I confirm that the information and documents provided by me are true, accurate and complete to the best of my knowledge.",
  },
  {
    id: "verification",
    title: "2. Authorization for Verification & Due Diligence",
    content:
      "I authorize Nayak Capital (Lenders) to verify the information and documents provided by me for the purpose of evaluating, processing, administering and maintaining my loan application/loan relationship, to the extent permitted by applicable law.",
  },
  {
    id: "terms_understanding",
    title: "3. Understanding of Loan Terms & Obligations",
    content:
      "I understand that the loan, if approved, will be subject to the applicable loan terms, repayment schedule, charges and other conditions communicated to me in the loan agreement or related documents.",
  },
  {
    id: "repayment_obligation",
    title: "4. Timely Repayment & Default Consequences",
    content:
      "I understand that I am responsible for making repayments on the agreed due dates. Any applicable consequences of late payment or default will be governed by the applicable loan documents and law. If you fail to pay the money on time, extra charges on the entire amount will be imposed, and the company reserves the right to confiscate/repossess any things, assets or items belonging to the borrower without prior consent.",
  },
  {
    id: "data_privacy",
    title: "5. Privacy, Information Handling & Retention",
    content:
      "I consent to the collection, use, storage and retention of my personal information for legitimate loan-related purposes, subject to applicable law and the lender's privacy practices.",
  },
  {
    id: "liability",
    title: "6. Legal Liability for Misrepresentation",
    content:
      "I understand that providing false or misleading information may result in rejection of the application and/or other action permitted by law.",
  },
];

/**
 * Institutional Personal Loan Agreement Standard Template Clauses.
 * Note: Legal terms are structured for clear review by appropriate legal counsel.
 */
export const LOAN_AGREEMENT_CLAUSES = [
  {
    section: "1. DEFINITIONS & INTERPRETATION",
    clauses: [
      {
        num: "1.1",
        title: "The Lender",
        text: "Nayak Capital, including its successors, permitted assigns, and authorized representatives.",
      },
      {
        num: "1.2",
        title: "The Borrower",
        text: "The individual or entity identified in Schedule A, who has applied for and been sanctioned the loan facility.",
      },
      {
        num: "1.3",
        title: "The Facility",
        text: "The financial loan facility sanctioned by the Lender to the Borrower in the principal sum set forth in the Sanction Schedule.",
      },
    ],
  },
  {
    section: "2. PRINCIPAL AMOUNT & DISBURSEMENT",
    clauses: [
      {
        num: "2.1",
        title: "Disbursement",
        text: "Subject to verification of conditions precedent, the Lender agrees to advance the Principal Sum into the designated bank account of the Borrower.",
      },
      {
        num: "2.2",
        title: "Deduction of Processing Charges",
        text: "The Lender may, where agreed in the Sanction Schedule, deduct approved processing fees and statutory stamp duty prior to net disbursement.",
      },
    ],
  },
  {
    section: "3. INTEREST, CHARGES & REPAYMENT SCHEDULE",
    clauses: [
      {
        num: "3.1",
        title: "Interest Computation",
        text: "Interest shall accrue on the outstanding principal balance from the disbursement date at the agreed contractual rate specified in Schedule A, calculated using the agreed calculation methodology.",
      },
      {
        num: "3.2",
        title: "Repayment Installments",
        text: "The Borrower covenants to repay the Total Amount Due in accordance with the specified Repayment Frequency and Due Dates through approved institutional payment channels.",
      },
      {
        num: "3.3",
        title: "Prepayment",
        text: "The Borrower may prepay the outstanding loan balance in whole or in part, subject to applicable advance notification and settlement of accrued interest up to the date of settlement.",
      },
    ],
  },
  {
    section: "4. BORROWER REPRESENTATIONS & COVENANTS",
    clauses: [
      {
        num: "4.1",
        title: "Capacity & Authority",
        text: "The Borrower represents having complete legal competence, capacity, and authority to enter into and perform obligations under this Agreement.",
      },
      {
        num: "4.2",
        title: "Use of Funds",
        text: "The Borrower covenants that the loan proceeds shall be utilized strictly for the lawful purpose declared in the application and shall not be diverted into speculative or unlawful activities.",
      },
      {
        num: "4.3",
        title: "Notification of Material Change",
        text: "The Borrower agrees to notify the Lender within 7 days of any material change in employment, business status, residential address, or contact credentials.",
      },
    ],
  },
  {
    section: "5. DEFAULT & REMEDIES",
    clauses: [
      {
        num: "5.1",
        title: "Events of Default",
        text: "An Event of Default occurs if the Borrower fails to pay any installment on the due date, breaches any covenant, provides false representation, or becomes subject to insolvency proceedings.",
      },
      {
        num: "5.2",
        title: "Lender Remedies & Acceleration",
        text: "Upon the occurrence of an Event of Default, the entire outstanding loan balance together with accrued interest shall immediately become due and payable. The Lender reserves all statutory remedies available under governing law.",
      },
    ],
  },
  {
    section: "6. GOVERNING LAW, JURISDICTION & SEVERABILITY",
    clauses: [
      {
        num: "6.1",
        title: "Governing Law",
        text: "This Agreement shall be governed by, and construed in accordance with, the laws of India. Courts in the designated registered jurisdiction shall have exclusive jurisdiction.",
      },
      {
        num: "6.2",
        title: "Severability & Amendments",
        text: "If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force. No amendment shall be binding unless executed in writing by both parties.",
      },
    ],
  },
];
