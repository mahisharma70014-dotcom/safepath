import { defaultSellSettings, type PaymentMethod, type RequestRecord } from "@/lib/data-model";
import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const serialize = (record: FirebaseFirestore.DocumentData, id: string): RequestRecord => ({
  id,
  ...record,
  createdAt:
    typeof record.createdAt === "string"
      ? record.createdAt
      : record.createdAt?.toDate?.().toLocaleString("en-IN", { hour12: false }) ?? "",
  updatedAt:
    typeof record.updatedAt === "string"
      ? record.updatedAt
      : record.updatedAt?.toDate?.().toLocaleString("en-IN", { hour12: false }) ?? undefined,
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const scope = request.nextUrl.searchParams.get("scope");

    let query: FirebaseFirestore.Query = adminDb.collection(FIRESTORE_PATHS.requests);
    if (session.role !== "admin" || scope === "mine") {
      query = query.where("userId", "==", session.uid);
    }

    const snapshot = await query.get();
    const requests = snapshot.docs.map((doc) => serialize(doc.data(), doc.id));
    requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session.role !== "seller") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as RequestRecord;
    const walletRef = adminDb.collection(FIRESTORE_PATHS.wallets).doc(session.uid);
    const sellSettingsRef = adminDb.doc(FIRESTORE_PATHS.sellSettings);
    const requestsRef = adminDb.collection(FIRESTORE_PATHS.requests).doc();

    await adminDb.runTransaction(async (transaction) => {
      const walletSnapshot = await transaction.get(walletRef);
      const wallet = walletSnapshot.exists
        ? walletSnapshot.data()
        : { userId: session.uid, availableUsdt: 0, lockedUsdt: 0, lastSettlementInr: 0, lastDepositUsdt: 0 };

      if (body.type === "sell" || body.type === "withdraw") {
        if (body.amountUsdt > wallet.availableUsdt) {
          throw new Error("Amount exceeds available USDT balance.");
        }
      }

      let requestPayload: FirebaseFirestore.DocumentData = {
        userId: session.uid,
        userEmail: session.email,
        type: body.type,
        amountUsdt: body.amountUsdt,
        network: body.network,
        status: "Pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (body.type === "deposit") {
        requestPayload = {
          ...requestPayload,
          walletAddress: body.walletAddress,
          screenshotName: body.screenshotName,
          screenshotDataUrl: body.screenshotDataUrl,
        };
      }

      if (body.type === "sell") {
        const sellSettingsSnap = await transaction.get(sellSettingsRef);
        const settings = sellSettingsSnap.exists
          ? { ...defaultSellSettings, ...sellSettingsSnap.data() }
          : defaultSellSettings;
        const method = body.paymentMethod as PaymentMethod;
        const rate = method === "UPI" ? settings.upiRate : method === "CDM" ? settings.cdmRate : settings.mixRate;
        const payoutDetails =
          method === "UPI"
            ? `UPI ID: ${settings.upiId} | Holder: ${settings.upiHolder}`
            : method === "CDM"
              ? `Bank: ${settings.bankName} | A/C: ${settings.accountNumber} | IFSC: ${settings.ifsc}`
              : `UPI: ${settings.upiId} | Bank A/C: ${settings.accountNumber}`;

        requestPayload = {
          ...requestPayload,
          paymentMethod: method,
          rate,
          estimatedInr: body.amountUsdt * rate,
          payoutDetails,
        };

        transaction.set(walletRef, {
          ...wallet,
          availableUsdt: wallet.availableUsdt - body.amountUsdt,
          lockedUsdt: wallet.lockedUsdt + body.amountUsdt,
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }

      if (body.type === "withdraw") {
        requestPayload = {
          ...requestPayload,
          destinationWallet: body.destinationWallet,
          screenshotName: body.screenshotName,
          screenshotDataUrl: body.screenshotDataUrl,
        };

        transaction.set(walletRef, {
          ...wallet,
          availableUsdt: wallet.availableUsdt - body.amountUsdt,
          lockedUsdt: wallet.lockedUsdt + body.amountUsdt,
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }

      transaction.set(requestsRef, requestPayload);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit request.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
