import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_MAX_AGE_SECONDS, computeAuthToken } from "@/lib/site-auth";

function safeRedirectPath(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "/";
  return path.startsWith("/") ? path : "/";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const submitted = String(formData.get("password") ?? "");
  const redirectPath = safeRedirectPath(formData.get("redirect"));
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword || submitted !== sitePassword) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(redirectPath, request.url), {
    status: 303,
  });
  response.cookies.set(AUTH_COOKIE, computeAuthToken(sitePassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
