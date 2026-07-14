import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    if (!isFirebaseAdminConfigured) {
      return NextResponse.json({ message: "Firebase admin not configured" }, { status: 503 });
    }

    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const userId = request.nextUrl.pathname.split("/").pop();
    if (!userId) {
      return NextResponse.json({ message: "Missing user id" }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const allowedFields = ["role", "banned", "kycStatus"];
    const updatePayload: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    await adminDb.collection(FIRESTORE_PATHS.users).doc(userId).set(updatePayload, { merge: true });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
