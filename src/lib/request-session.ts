import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import { NextRequest } from "next/server";

export async function requireSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    throw new Error("Unauthorized");
  }

  const session = await verifySession(token);
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
