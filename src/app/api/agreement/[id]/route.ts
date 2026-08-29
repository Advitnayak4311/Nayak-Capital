import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { generateAgreementId, calculateEMI } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    let agreement = dbStore.getAgreementById(rawId);

    if (!agreement) {
      // Check if application exists (by applicationId, agreementId, or internal id)
      const app =
        dbStore.getApplicationById(rawId) ||
        dbStore.getApplications().find(
          (a) =>
            a.applicationId.toLowerCase() === rawId.toLowerCase() ||
            (a.agreementId && a.agreementId.toLowerCase() === rawId.toLowerCase())
        );

      if (app) {
        // Check if an agreement for this application already exists in store
        const existingAgr = dbStore.getAgreements().find(
          (a) => a.applicationId.toLowerCase() === app.applicationId.toLowerCase()
        );

        if (existingAgr) {
          return NextResponse.json({ success: true, agreement: existingAgr });
        }

        const rate =
          app.loan.proposedInterestRateAnnual ||
          (app.loan.tenureMonths <= 3 ? 13.5 : 14.7);

        const { emi, totalInterest, totalPayable } = calculateEMI(
          app.loan.amount,
          rate,
          app.loan.tenureMonths
        );

        const assignedAgreementId =
          app.agreementId ||
          (rawId.toUpperCase().startsWith("NC-AGR") ? rawId.toUpperCase() : generateAgreementId());

        const newAgr = dbStore.createAgreement({
          agreementId: assignedAgreementId,
          applicationId: app.applicationId,
          borrowerName: app.borrower.fullName,
          borrowerAddress: app.borrower.currentAddress,
          borrowerMobile: app.borrower.mobile,
          borrowerEmail: app.borrower.email,
          principalAmount: app.loan.amount,
          interestRateAnnual: rate,
          calculationMethod: app.loan.calculationMethod || "REDUCING_BALANCE",
          tenureMonths: app.loan.tenureMonths,
          repaymentFrequency: app.loan.repaymentFrequency || "MONTHLY",
          installmentAmount: emi,
          totalInterest,
          totalPayable,
          disbursementDate: app.loan.proposedDisbursementDate || new Date().toISOString().split("T")[0],
          agreementVersion: "1.0.0",
          templateVersion: "1.0.0",
          status: "PENDING_SIGNATURE",
          lenderSignature: {
            signatoryName: "Advith Nayak",
            signatoryTitle: "Managing Director & Credit Underwriter, Nayak Capital",
            signatureData: "Advith Nayak",
            signedAt: new Date().toISOString(),
          },
        });

        return NextResponse.json({ success: true, agreement: newAgr });
      }

      return NextResponse.json(
        { success: false, error: "Loan Agreement not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, agreement });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
