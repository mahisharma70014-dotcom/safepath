import { defaultSellSettings, type PaymentMethod, type RequestRecord } from "@/lib/data-model";
import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const serialize = (record: FirebaseFirestore.DocumentData, id: string): RequestRecord => ({
  id,
  userId: String(record.userId ?? ""),
  userEmail: String(record.userEmail ?? ""),
  userName: record.userName ? String(record.userName) : undefined,
  type: (record.type ?? "deposit") as RequestRecord["type"],
  amountUsdt: typeof record.amountUsdt === "number" ? record.amountUsdt : 0,
  network: (record.network ?? "TRC20") as RequestRecord["network"],
  status: (record.status ?? "Pending") as RequestRecord["status"],
  createdAt:
    typeof record.createdAt === "string"
      ? record.createdAt
      : record.createdAt?.toDate?.().toLocaleString("en-IN", { hour12: false }) ?? "",
  updatedAt:
    typeof record.updatedAt === "string"
      ? record.updatedAt
      : record.updatedAt?.toDate?.().toLocaleString("en-IN", { hour12: false }) ?? undefined,
  walletAddress: record.walletAddress ? String(record.walletAddress) : undefined,
  screenshotName: record.screenshotName ? String(record.screenshotName) : undefined,
  screenshotDataUrl: record.screenshotDataUrl ? String(record.screenshotDataUrl) : undefined,
  transactionHash: record.transactionHash ? String(record.transactionHash) : undefined,
  paymentMethod: record.paymentMethod as RequestRecord["paymentMethod"],
  rate: typeof record.rate === "number" ? record.rate : undefined,
  estimatedInr: typeof record.estimatedInr === "number" ? record.estimatedInr : undefined,
  payoutDetails: record.payoutDetails ? String(record.payoutDetails) : undefined,
  destinationWallet: record.destinationWallet ? String(record.destinationWallet) : undefined,
  rejectionReason: record.rejectionReason ? String(record.rejectionReason) : undefined,
  adminNote: record.adminNote ? String(record.adminNote) : undefined,
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

    const body = (await request.json()) as Partial<RequestRecord>;
    const validTypes = new Set(["deposit", "sell", "withdraw"]);
    const validNetworks = new Set(["TRC20", "BEP20", "ERC20"]);

    if (!body.type || !validTypes.has(body.type)) {
      throw new Error("Invalid request type.");
    }

    if (body.amountUsdt === undefined || typeof body.amountUsdt !== "number" || !Number.isFinite(body.amountUsdt) || body.amountUsdt <= 0) {
      throw new Error("Enter a valid amount.");
    }

    if (body.network && !validNetworks.has(body.network)) {
      throw new Error("Invalid network.");
    }

    if (body.type === "deposit") {
      if (!body.walletAddress?.trim()) {
        throw new Error("Wallet address is required.");
      }
      if (!body.screenshotName?.trim() || !body.screenshotDataUrl?.trim()) {
        throw new Error("Payment proof is required.");
      }
    }

    const walletRef = adminDb.collection(FIRESTORE_PATHS.wallets).doc(session.uid);
    const sellSettingsRef = adminDb.doc(FIRESTORE_PATHS.sellSettings);
    const requestsRef = adminDb.collection(FIRESTORE_PATHS.requests).doc();

    await adminDb.runTransaction(async (transaction) => {
      const walletSnapshot = await transaction.get(walletRef);
      const wallet = walletSnapshot.exists
        ? (walletSnapshot.data() ?? {
            userId: session.uid,
            availableUsdt: 0,
            lockedUsdt: 0,
            lastSettlementInr: 0,
            lastDepositUsdt: 0,
          })
        : { userId: session.uid, availableUsdt: 0, lockedUsdt: 0, lastSettlementInr: 0, lastDepositUsdt: 0 };

      const userSnapshot = await transaction.get(adminDb.collection(FIRESTORE_PATHS.users).doc(session.uid));
      const userData = userSnapshot.exists ? userSnapshot.data() : {};
      const banned = Boolean(userData?.banned);
      const kycStatus = String(userData?.kycStatus ?? "pending").toLowerCase();

      if (banned) {
        throw new Error("Your account is blocked. Contact support.");
      }

      if ((body.type === "sell" || body.type === "withdraw") && kycStatus !== "approved") {
        throw new Error("KYC must be approved before creating sell or withdraw requests.");
      }

      if (body.type === "sell" || body.type === "withdraw") {
        const amount = typeof body.amountUsdt === "number" ? body.amountUsdt : 0;
        if (amount > wallet.availableUsdt) {
          throw new Error("Amount exceeds available USDT balance.");
        }
      }

      const userName = String(userData?.fullName ?? userData?.displayName ?? session.email ?? "");

      let requestPayload: FirebaseFirestore.DocumentData = {
        userId: session.uid,
        userEmail: session.email,
        userName,
        type: body.type,
        amountUsdt: body.amountUsdt,
        network: body.network ?? "TRC20",
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
          transactionHash: body.transactionHash?.trim() || undefined,
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

        const amount = typeof body.amountUsdt === "number" ? body.amountUsdt : 0;
        requestPayload = {
          ...requestPayload,
          paymentMethod: method,
          rate,
          estimatedInr: amount * rate,
          payoutDetails,
        };

        transaction.set(walletRef, {
          ...wallet,
          availableUsdt: wallet.availableUsdt - amount,
          lockedUsdt: wallet.lockedUsdt + amount,
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }

      if (body.type === "withdraw") {
        const amount = typeof body.amountUsdt === "number" ? body.amountUsdt : 0;
        requestPayload = {
          ...requestPayload,
          destinationWallet: body.destinationWallet,
          screenshotName: body.screenshotName,
          screenshotDataUrl: body.screenshotDataUrl,
        };

        transaction.set(walletRef, {
          ...wallet,
          availableUsdt: wallet.availableUsdt - amount,
          lockedUsdt: wallet.lockedUsdt + amount,
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
