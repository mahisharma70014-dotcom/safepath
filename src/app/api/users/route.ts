import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseAdminConfigured) {
      return NextResponse.json({ message: "Firebase admin not configured" }, { status: 503 });
    }

    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const snapshot = await adminDb.collection(FIRESTORE_PATHS.users).get();
    const users = snapshot.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          uid: doc.id,
          ...data,
        } as {
          uid: string;
          email?: unknown;
          role?: unknown;
        };
      })
      .filter((user) =>
        typeof user.email === "string" &&
        user.email.includes("@") &&
        (user.role === "seller" || user.role === "admin"),
      );

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
