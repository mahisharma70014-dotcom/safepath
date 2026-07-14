import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const sellerPrefix = "/seller";
const adminPrefix = "/admin";
const authRoutes = new Set(["/login", "/register", "/forgot-password"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (pathname.startsWith(sellerPrefix)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "seller") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (pathname.startsWith(adminPrefix)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/seller/dashboard", request.url));
    }
  }

  if (authRoutes.has(pathname) && session) {
    const target = session.role === "admin" ? "/admin/dashboard" : "/seller/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
