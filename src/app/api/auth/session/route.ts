import { bootstrapSessionUser } from "@/lib/auth-server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME, signSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseAdminConfigured) {
      return NextResponse.json(
        { message: "Firebase Admin is not configured on the server." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      idToken?: string;
      fullName?: string;
      phone?: string;
      roleHint?: "seller" | "admin";
    };

    if (!body.idToken) {
      return NextResponse.json({ message: "Missing idToken." }, { status: 400 });
    }

    const sessionUser = await bootstrapSessionUser({
      idToken: body.idToken,
      fullName: body.fullName,
      phone: body.phone,
      roleHint: body.roleHint,
    });
    const token = await signSession(sessionUser);

    const response = NextResponse.json({ user: sessionUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create session.";
    return NextResponse.json({ message }, { status: 401 });
  }
}
