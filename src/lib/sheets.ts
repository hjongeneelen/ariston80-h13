import { google } from "googleapis";
import { unstable_cache } from "next/cache";
import { placeholderTeamData } from "@/data/placeholder-team-data";
import type { Fine, FineTariff, Player, TeamData } from "./types";

/**
 * Expected sheet layout (tab name → columns), see docs/google-sheets-setup.md:
 *  - Players: nr, name, nickname, position, played, minutes, goals, assists,
 *             attendancePct, yellowCards, redCards, motm, streak, fines, note
 *  - Fines:   date, player, reason, amount
 *  - Tariffs: reason, amount
 */
const RANGES = {
  players: "Players!A2:O",
  fines: "Fines!A2:D",
  tariffs: "Tariffs!A2:B",
};

function getCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !rawKey || !sheetId) return null;
  return { email, privateKey: rawKey.replace(/\\n/g, "\n"), sheetId };
}

function toNumber(value: string | undefined, fallback = 0): number {
  if (value === undefined || value === "") return fallback;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function rowsToPlayers(rows: string[][]): Player[] {
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      nr: toNumber(row[0]),
      name: row[1] ?? "",
      nickname: row[2] ?? "",
      position: row[3] ?? "",
      played: toNumber(row[4]),
      minutes: toNumber(row[5]),
      goals: toNumber(row[6]),
      assists: toNumber(row[7]),
      attendancePct: toNumber(row[8]),
      yellowCards: toNumber(row[9]),
      redCards: toNumber(row[10]),
      motm: toNumber(row[11]),
      streak: toNumber(row[12]),
      fines: toNumber(row[13]),
      note: row[14] ?? "",
    }));
}

function rowsToFines(rows: string[][]): Fine[] {
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      date: row[0] ?? "",
      player: row[1] ?? "",
      reason: row[2] ?? "",
      amount: toNumber(row[3]),
    }));
}

function rowsToTariffs(rows: string[][]): FineTariff[] {
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      reason: row[0] ?? "",
      amount: toNumber(row[1]),
    }));
}

async function loadTeamDataFromSheet(): Promise<TeamData> {
  const credentials = getCredentials();
  if (!credentials) {
    return placeholderTeamData;
  }

  try {
    const auth = new google.auth.JWT({
      email: credentials.email,
      key: credentials.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const [playersRes, finesRes, tariffsRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: credentials.sheetId,
        range: RANGES.players,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: credentials.sheetId,
        range: RANGES.fines,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: credentials.sheetId,
        range: RANGES.tariffs,
      }),
    ]);

    const players = rowsToPlayers((playersRes.data.values as string[][]) ?? []);
    const fines = rowsToFines((finesRes.data.values as string[][]) ?? []);
    const tariffs = rowsToTariffs((tariffsRes.data.values as string[][]) ?? []);

    return {
      players,
      fines,
      tariffs,
      finePotTotal: fines.reduce((sum, fine) => sum + fine.amount, 0),
      syncedAt: new Date().toISOString(),
      isPlaceholder: false,
    };
  } catch (error) {
    console.error("[sheets] Sync met Google Sheet mislukt, val terug op placeholder data:", error);
    return placeholderTeamData;
  }
}

/**
 * Cached read of the team spreadsheet. Refreshes at most every 30 minutes;
 * call revalidateTag("team-data") (see app/api/cron/sync-sheet) to force an
 * immediate refresh, e.g. from a scheduled job right after a Saturday match.
 */
export const getTeamData = unstable_cache(loadTeamDataFromSheet, ["team-data"], {
  revalidate: 1800,
  tags: ["team-data"],
});
