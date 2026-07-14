import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const snapshot = await adminDb.collection(FIRESTORE_PATHS.wallets).doc(session.uid).get();

    return NextResponse.json({
      wallet: snapshot.exists
        ? snapshot.data()
        : {
            userId: session.uid,
            availableUsdt: 0,
            lockedUsdt: 0,
            lastSettlementInr: 0,
            lastDepositUsdt: 0,
          },
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
