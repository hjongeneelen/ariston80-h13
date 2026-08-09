import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, isValidAuthToken } from "@/lib/site-auth";

/**
 * Keeps the deployed site publicly reachable but gated behind one shared
 * password (SITE_PASSWORD env var) — the site URL and GitHub repo can stay
 * public while the actual content requires the team password to view.
 * Leaving SITE_PASSWORD unset disables the gate entirely.
 */
export function proxy(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (token && isValidAuthToken(token, sitePassword)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|api/login|api/logout|api/cron|_next/static|_next/image|favicon.ico|brand/).*)",
  ],
};
