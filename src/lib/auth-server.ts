import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/auth";
import { Timestamp } from "firebase-admin/firestore";

export type SessionBootstrapInput = {
  idToken: string;
  fullName?: string;
  phone?: string;
  roleHint?: UserRole;
};

const DEFAULT_ADMIN_EMAILS = ["admin@company.com"];

const getAdminEmails = () => {
  const configured = process.env.ADMIN_EMAILS?.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return configured?.length ? configured : DEFAULT_ADMIN_EMAILS;
};

export const resolveRole = (email: string, roleHint?: UserRole): UserRole => {
  if (roleHint === "admin") {
    return getAdminEmails().includes(email.toLowerCase()) ? "admin" : "seller";
  }

  return getAdminEmails().includes(email.toLowerCase()) ? "admin" : "seller";
};

export const bootstrapSessionUser = async ({ idToken, fullName, phone, roleHint }: SessionBootstrapInput) => {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const email = decoded.email?.toLowerCase();

  if (!email) {
    throw new Error("Authenticated user email is missing.");
  }

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const walletRef = adminDb.collection("wallets").doc(decoded.uid);
  const existing = await userRef.get();
  const existingRole = existing.exists ? String(existing.data()?.role ?? "") : "";
  const role = existingRole === "admin" || existingRole === "seller"
    ? existingRole
    : resolveRole(email, roleHint);

  const userPayload = {
    email,
    fullName: fullName ?? existing.data()?.fullName ?? decoded.name ?? "SafePath User",
    phone: phone ?? existing.data()?.phone ?? "",
    role,
    kycStatus: existing.data()?.kycStatus ?? "pending",
    banned: existing.data()?.banned ?? false,
    updatedAt: Timestamp.now(),
    createdAt: existing.exists ? existing.data()?.createdAt ?? Timestamp.now() : Timestamp.now(),
  };

  await userRef.set(userPayload, { merge: true });

  if (!(await walletRef.get()).exists) {
    await walletRef.set({
      userId: decoded.uid,
      availableUsdt: role === "admin" ? 0 : 0,
      lockedUsdt: 0,
      lastSettlementInr: 0,
      lastDepositUsdt: 0,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  }

  return {
    uid: decoded.uid,
    email,
    fullName: userPayload.fullName,
    role,
  };
};
