import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as { status?: "Pending" | "Processing" | "Completed" | "Rejected" };
    if (!body.status) {
      return NextResponse.json({ message: "Missing status" }, { status: 400 });
    }

    const requestRef = adminDb.collection(FIRESTORE_PATHS.requests).doc(id);
    await adminDb.runTransaction(async (transaction) => {
      const requestSnapshot = await transaction.get(requestRef);
      if (!requestSnapshot.exists) {
        throw new Error("Request not found.");
      }

      const requestData = requestSnapshot.data()!;
      const previousStatus = requestData.status as string;
      if (previousStatus === body.status) {
        return;
      }

      const walletRef = adminDb.collection(FIRESTORE_PATHS.wallets).doc(requestData.userId);
      const walletSnapshot = await transaction.get(walletRef);
      const wallet = walletSnapshot.exists
        ? walletSnapshot.data()!
        : { availableUsdt: 0, lockedUsdt: 0, lastSettlementInr: 0, lastDepositUsdt: 0 };

      if (requestData.type === "deposit" && previousStatus === "Pending" && body.status === "Processing") {
        transaction.set(requestRef, { status: body.status, updatedAt: Timestamp.now() }, { merge: true });
        return;
      }

      if (requestData.type === "deposit" && body.status === "Completed" && previousStatus !== "Completed") {
        transaction.set(walletRef, {
          ...wallet,
          availableUsdt: wallet.availableUsdt + requestData.amountUsdt,
          lastDepositUsdt: requestData.amountUsdt,
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }

      if (requestData.type === "sell") {
        if (body.status === "Rejected" && previousStatus !== "Rejected") {
          transaction.set(walletRef, {
            ...wallet,
            availableUsdt: wallet.availableUsdt + requestData.amountUsdt,
            lockedUsdt: Math.max(0, wallet.lockedUsdt - requestData.amountUsdt),
            updatedAt: Timestamp.now(),
          }, { merge: true });
        }

        if (body.status === "Completed" && previousStatus !== "Completed") {
          transaction.set(walletRef, {
            ...wallet,
            lockedUsdt: Math.max(0, wallet.lockedUsdt - requestData.amountUsdt),
            lastSettlementInr: requestData.estimatedInr ?? 0,
            updatedAt: Timestamp.now(),
          }, { merge: true });
        }
      }

      if (requestData.type === "withdraw") {
        if (body.status === "Rejected" && previousStatus !== "Rejected") {
          transaction.set(walletRef, {
            ...wallet,
            availableUsdt: wallet.availableUsdt + requestData.amountUsdt,
            lockedUsdt: Math.max(0, wallet.lockedUsdt - requestData.amountUsdt),
            updatedAt: Timestamp.now(),
          }, { merge: true });
        }

        if (body.status === "Completed" && previousStatus !== "Completed") {
          transaction.set(walletRef, {
            ...wallet,
            lockedUsdt: Math.max(0, wallet.lockedUsdt - requestData.amountUsdt),
            updatedAt: Timestamp.now(),
          }, { merge: true });
        }
      }

      transaction.set(requestRef, {
        status: body.status,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update request.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
