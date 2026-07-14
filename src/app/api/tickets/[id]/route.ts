import type { SupportTicketStatus } from "@/lib/data-model";
import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as { status?: SupportTicketStatus };

    if (!body.status) {
      return NextResponse.json({ message: "Missing status" }, { status: 400 });
    }

    await adminDb.collection(FIRESTORE_PATHS.tickets).doc(id).set(
      {
        status: body.status,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
