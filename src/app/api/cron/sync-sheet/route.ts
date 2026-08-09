import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getTeamData } from "@/lib/sheets";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

/**
 * Forces an immediate re-sync of the team spreadsheet. The data is already
 * refreshed automatically every 30 min via the cache in lib/sheets.ts — this
 * endpoint exists for on-demand syncs (e.g. right after entering Saturday's
 * results) and can also be wired to an external scheduler for periodic syncs.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("team-data", "max");
  const data = await getTeamData();

  return NextResponse.json({
    ok: true,
    isPlaceholder: data.isPlaceholder,
    syncedAt: data.syncedAt,
    players: data.players.length,
  });
}

export async function GET(request: Request) {
  return POST(request);
}
