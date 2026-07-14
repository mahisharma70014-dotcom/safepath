import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseAdminConfigured) {
      return NextResponse.json(
        { message: "Firebase admin not configured" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      uid: string;
      email: string;
      fullName: string;
      adminPassword?: string;
    };

    const { uid, email, fullName, adminPassword } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { message: "Missing uid or email" },
        { status: 400 },
      );
    }

    // Check if user exists
    const userRef = adminDb.collection("users").doc(uid);
    const existing = await userRef.get();

    if (existing.exists && existing.data()?.role === "admin") {
      return NextResponse.json(
        { message: "User is already admin" },
        { status: 409 },
      );
    }

    // Update user to admin role
    const userPayload = {
      email,
      fullName: fullName || existing.data()?.fullName || "Admin User",
      role: "admin",
      updatedAt: Timestamp.now(),
      createdAt: existing.exists ? existing.data()?.createdAt : Timestamp.now(),
    };

    await userRef.set(userPayload, { merge: true });

    // Store admin credentials if provided
    if (adminPassword) {
      const adminCredsRef = adminDb.collection("admin-credentials").doc(uid);
      await adminCredsRef.set(
        {
          uid,
          email,
          passwordHash: Buffer.from(adminPassword).toString("base64"), // Note: Use proper bcrypt in production
          createdAt: Timestamp.now(),
        },
        { merge: true },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      user: userPayload,
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 },
    );
  }
}
