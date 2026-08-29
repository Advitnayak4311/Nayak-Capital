import { NextRequest, NextResponse } from "next/server";
import { fullApplicationSubmissionSchema } from "@/lib/validation/applicationSchema";
import { dbStore } from "@/lib/db/store";
import { generateApplicationId, calculateEMI } from "@/lib/utils";
import { sendApplicationSubmittedNotifications } from "@/lib/email/emailService";
import { LoanApplication } from "@/lib/models/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const applications = dbStore.getApplications();
    return NextResponse.json({ success: true, count: applications.length, applications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Strict Server-Side Validation
    const validationResult = fullApplicationSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMap: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join(".");
        errorMap[path] = err.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed on submitted application data.",
          details: errorMap,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // 2. Generate Unique Human-Readable Application ID (e.g. NC-APP-2026-XXXX)
    const count = dbStore.getApplications().length + 1;
    const applicationId = generateApplicationId(count);

    // Compute loan rate and EMI
    const rate =
      validatedData.loan.proposedInterestRateAnnual ||
      (validatedData.loan.tenureMonths <= 3 ? 13.5 : 14.7);
    const { emi, totalPayable } = calculateEMI(
      validatedData.loan.amount,
      rate,
      validatedData.loan.tenureMonths
    );

    const loanWithComputedMetrics = {
      ...validatedData.loan,
      proposedInterestRateAnnual: rate,
      estimatedEMI: validatedData.loan.estimatedEMI || emi,
      estimatedTotalPayable: validatedData.loan.estimatedTotalPayable || totalPayable,
    };

    // 3. Construct Application Record
    const initialHistory = [
      {
        status: "SUBMITTED" as const,
        changedBy: `${validatedData.borrower.fullName} (Borrower)`,
        changedAt: new Date().toISOString(),
        note: "Digital application submitted and verified.",
      },
    ];

    const newApp = dbStore.addApplication({
      applicationId,
      borrower: validatedData.borrower,
      loan: loanWithComputedMetrics,
      kyc: validatedData.kyc,
      income: validatedData.income,
      guarantor: validatedData.guarantor,
      documents: validatedData.documents,
      consent: validatedData.consent,
      status: "SUBMITTED",
      statusHistory: initialHistory,
      adminNotes: [],
      messages: [],
    });

    // 4. Trigger Email Notifications asynchronously in the background so submission is instantaneous (<100ms)
    sendApplicationSubmittedNotifications(newApp).catch((emailErr) => {
      console.warn("Async email notification error (non-fatal):", emailErr);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully.",
        applicationId: newApp.applicationId,
        id: newApp.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Application submission error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
