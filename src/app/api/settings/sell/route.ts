import { defaultSellSettings, type SellSettings } from "@/lib/data-model";
import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const snapshot = await adminDb.doc(FIRESTORE_PATHS.sellSettings).get();
  return NextResponse.json({
    settings: snapshot.exists
      ? ({ ...defaultSellSettings, ...snapshot.data() } as SellSettings)
      : defaultSellSettings,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as SellSettings;
    await adminDb.doc(FIRESTORE_PATHS.sellSettings).set(
      {
        ...body,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
