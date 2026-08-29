import { NextRequest, NextResponse } from "next/server";
import { signAdminToken } from "@/lib/security/auth";
import { dbStore } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Administrative credentials
    const validEmail = (process.env.ADMIN_EMAIL || "advithnayak1118@gmail.com").replace(/^["']|["']$/g, "").trim();
    const validPassword = (process.env.ADMIN_PASSWORD || "Advitnayak4311#").replace(/^["']|["']$/g, "").trim();

    if (
      email?.trim().toLowerCase() === validEmail.toLowerCase() &&
      password === validPassword
    ) {
      const token = signAdminToken({
        userId: "admin-master-01",
        email: validEmail,
        name: "Advith Nayak",
        role: "SUPER_ADMIN",
      });

      dbStore.addAuditLog({
        actorId: "admin-master-01",
        actorName: "Advith Nayak",
        actorRole: "ADMIN",
        action: "ADMIN_LOGIN",
        targetId: "ADMIN_PORTAL",
        targetType: "USER",
        metadata: { ip: req.headers.get("x-forwarded-for") || "127.0.0.1" },
      });

      const response = NextResponse.json({
        success: true,
        message: "Authentication successful",
        user: {
          id: "admin-master-01",
          email: validEmail,
          name: "Advith Nayak",
          role: "SUPER_ADMIN",
        },
        token,
      });

      // Set secure HTTP-only cookie
      response.cookies.set({
        name: "nc_admin_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12, // 12 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid administrative credentials." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
