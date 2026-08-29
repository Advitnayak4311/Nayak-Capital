import { NextRequest, NextResponse } from "next/server";
import { customerLookupSchema } from "@/lib/validation/authSchema";
import { dbStore } from "@/lib/db/store";
import { signCustomerToken } from "@/lib/security/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = customerLookupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide both your Application ID and registered mobile or email.",
        },
        { status: 400 }
      );
    }

    const { applicationId, mobileOrEmail } = parseResult.data;

    const application = dbStore.findApplicationForCustomer(applicationId, mobileOrEmail);

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No application found matching that Reference ID and registered contact. Please check your credentials.",
        },
        { status: 404 }
      );
    }

    // Generate secure customer token
    const token = signCustomerToken({
      applicationId: application.applicationId,
      mobile: application.borrower.mobile,
      email: application.borrower.email,
    });

    const response = NextResponse.json({
      success: true,
      application,
      token,
    });

    response.cookies.set({
      name: "nc_cust_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
