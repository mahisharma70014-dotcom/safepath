import type { SupportTicket } from "@/lib/data-model";
import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const serialize = (record: FirebaseFirestore.DocumentData, id: string): SupportTicket => ({
  id,
  userId: String(record.userId ?? ""),
  userEmail: String(record.userEmail ?? ""),
  subject: String(record.subject ?? ""),
  category: (record.category ?? "Order issue") as SupportTicket["category"],
  message: String(record.message ?? ""),
  status: (record.status ?? "Open") as SupportTicket["status"],
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

    let query: FirebaseFirestore.Query = adminDb.collection(FIRESTORE_PATHS.tickets);
    if (session.role !== "admin" || scope === "mine") {
      query = query.where("userId", "==", session.uid);
    }

    const snapshot = await query.get();
    const tickets = snapshot.docs.map((doc) => serialize(doc.data(), doc.id));
    tickets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ tickets });
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

    const body = (await request.json()) as {
      subject?: string;
      category?: "Order issue" | "Wallet issue" | "KYC issue" | "Account security";
      message?: string;
    };

    if (!body.subject || !body.category || !body.message) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    await adminDb.collection(FIRESTORE_PATHS.tickets).add({
      userId: session.uid,
      userEmail: session.email,
      subject: body.subject.trim(),
      category: body.category,
      message: body.message.trim(),
      status: "Open",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
