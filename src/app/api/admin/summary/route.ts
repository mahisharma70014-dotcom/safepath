import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { NextRequest, NextResponse } from "next/server";

const numberValue = (value: unknown) => (typeof value === "number" ? value : 0);
const timeValue = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleString("en-IN", { hour12: false });
  }
  return "";
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [usersSnapshot, requestsSnapshot, walletsSnapshot] = await Promise.all([
      adminDb.collection(FIRESTORE_PATHS.users).get(),
      adminDb.collection(FIRESTORE_PATHS.requests).get(),
      adminDb.collection(FIRESTORE_PATHS.wallets).get(),
    ]);

    const requests: Array<FirebaseFirestore.DocumentData & { id: string }> = requestsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const pendingKyc = usersSnapshot.docs.filter((doc) => {
      const status = String(doc.data().kycStatus ?? "").toLowerCase();
      return status === "pending" || status === "submitted";
    }).length;

    const completedSells = requests.filter((item) => item.type === "sell" && item.status === "Completed");
    const depositRequests = requests.filter((item) => item.type === "deposit").length;
    const pendingDepositRequests = requests.filter((item) => item.type === "deposit" && item.status === "Pending").length;
    const withdrawalRequests = requests.filter((item) => item.type === "withdraw").length;
    const completedTransactions = completedSells.length;
    const totalWalletBalance = walletsSnapshot.docs.reduce((sum, doc) => sum + numberValue(doc.data().availableUsdt), 0);
    const revenue30d = completedSells.reduce((sum, item) => {
      const estimated = numberValue(item.estimatedInr);
      return sum + estimated;
    }, 0);

    const recentRequests = requests
      .sort((a, b) => {
        const aTime = new Date(String(a.createdAt ?? "")).getTime() || 0;
        const bTime = new Date(String(b.createdAt ?? "")).getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        type: String(item.type ?? ""),
        status: String(item.status ?? ""),
        amountUsdt: numberValue(item.amountUsdt),
        userEmail: String(item.userEmail ?? ""),
        createdAt: timeValue(item.createdAt),
      }));

    const recentDepositRequests = requests
      .filter((item) => item.type === "deposit")
      .sort((a, b) => {
        const aTime = new Date(String(a.createdAt ?? "")).getTime() || 0;
        const bTime = new Date(String(b.createdAt ?? "")).getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        type: String(item.type ?? ""),
        status: String(item.status ?? ""),
        amountUsdt: numberValue(item.amountUsdt),
        userEmail: String(item.userEmail ?? ""),
        network: String(item.network ?? ""),
        createdAt: timeValue(item.createdAt),
      }));

    return NextResponse.json({
      metrics: {
        totalUsers: usersSnapshot.size,
        verifiedUsers: usersSnapshot.docs.filter((doc) => doc.data().role === "seller" || doc.data().role === "admin").length,
        pendingKyc,
        revenue30d,
        depositRequests,
        pendingDepositRequests,
        withdrawalRequests,
        completedTransactions,
        totalWalletBalance,
      },
      recentRequests,
      recentDepositRequests,
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
