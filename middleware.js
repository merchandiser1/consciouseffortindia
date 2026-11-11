import { NextResponse } from "next/server";
import { COOKIE_NAME, LOGIN_PATH, DASHBOARD_PATH, verifyToken } from "@/app/lib/auth/jwt";

// Fast edge check (signature + expiry). Full check (DB / tokenVersion)
// happens on the server in app/consciousmain/dashboard/layout.js.
// Next.js 16: if you renamed this file to proxy.js, rename the function to `proxy`.
export async function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (pathname.startsWith(DASHBOARD_PATH) && !payload) {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }
  // "expired" flag prevents a redirect loop when the token is valid but revoked
  if (pathname === LOGIN_PATH && payload && !searchParams.has("expired")) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, req.url));
  }
  return NextResponse.next();
}

// matcher must be a literal: keep in sync with LOGIN_PATH / DASHBOARD_PATH in app/lib/auth/jwt.js
export const config = { matcher: ["/consciousmain/dashboard/:path*", "/consciousmain/login"] };