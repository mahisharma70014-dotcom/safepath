import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

type SiteSettings = {
  maintenanceMessage: string;
  minimumSellAmount: number;
  maintenanceMode: boolean;
};

export async function GET(request: NextRequest) {
  try {
    await requireSession(request);
    const snapshot = await adminDb.doc(FIRESTORE_PATHS.siteSettings).get();
    const settings = snapshot.exists
      ? ({ maintenanceMessage: "", minimumSellAmount: 100, maintenanceMode: false, ...(snapshot.data() as Partial<SiteSettings>) } as SiteSettings)
      : { maintenanceMessage: "", minimumSellAmount: 100, maintenanceMode: false };
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isFirebaseAdminConfigured) {
      return NextResponse.json({ message: "Firebase admin not configured" }, { status: 503 });
    }

    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as SiteSettings;
    await adminDb.doc(FIRESTORE_PATHS.siteSettings).set(
      {
        maintenanceMessage: body.maintenanceMessage ?? "",
        minimumSellAmount: Number(body.minimumSellAmount ?? 100),
        maintenanceMode: Boolean(body.maintenanceMode),
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
