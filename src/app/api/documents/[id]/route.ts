import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docId = params.id;
    // Find document across applications
    const applications = dbStore.getApplications();
    let foundDoc: any = null;

    for (const app of applications) {
      const d = app.documents.find((doc) => doc.id === docId);
      if (d) {
        foundDoc = d;
        break;
      }
    }

    if (!foundDoc) {
      return NextResponse.json({ success: false, error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document: foundDoc,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
