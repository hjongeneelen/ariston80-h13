import { createHash, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "h13_auth";
export const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export function computeAuthToken(password: string): string {
  return createHash("sha256").update(`ariston-h13::${password}`).digest("hex");
}

export function isValidAuthToken(token: string, password: string): boolean {
  const expected = computeAuthToken(password);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
