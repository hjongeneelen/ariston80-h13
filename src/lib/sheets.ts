import { google } from "googleapis";
import { unstable_cache } from "next/cache";
import { placeholderTeamData } from "@/data/placeholder-team-data";
import type { TeamData } from "./types";
import {
  buildFines,
  buildPlayers,
  buildTariffs,
  parseAttendance,
  parseSquadInfo,
} from "./sheet-parsers";

/**
 * Real H13 spreadsheets (see docs/google-sheets-setup.md):
 *  - GOOGLE_SHEET_ID        → "H13 gegevens": tab 'H13 spelerslijst' (squad) +
 *                             tab 'Aanwezigheid jaar 4' (availability matrix).
 *  - GOOGLE_FINES_SHEET_ID  → "H13 Boetesoverzicht 2026/27": tab 'Boetes'
 *                             (+ optional 'Tarieven'). Defaults to GOOGLE_SHEET_ID.
 *
 * The site only shows data the sheets actually track: squad, positions, notes,
 * attendance % and streaks (derived from the Ja/Nee matrix), and fines. Match
 * stats (goals/assists/minutes/cards/MOTM) aren't tracked anywhere, so they
 * stay at 0 and the UI hides those columns instead of showing fake zeros.
 */
const RANGES = {
  players: "'H13 spelerslijst'!A2:H200",
  attendance: "'Aanwezigheid jaar 4'!A1:Z200",
  fines: "Boetes!A2:E200",
  tariffs: "Tarieven!A2:B100",
};

function getCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const gegevensId = process.env.GOOGLE_SHEET_ID;
  if (!email || !rawKey || !gegevensId) return null;
  return {
    email,
    privateKey: rawKey.replace(/\\n/g, "\n"),
    gegevensId,
    finesId: process.env.GOOGLE_FINES_SHEET_ID || gegevensId,
  };
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

    const [squadRes, attendanceRes, finesRes, tariffsRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: credentials.gegevensId,
        range: RANGES.players,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: credentials.gegevensId,
        range: RANGES.attendance,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: credentials.finesId,
        range: RANGES.fines,
      }),
      // 'Tarieven' tab is optional — swallow a missing-tab error, fall back below.
      sheets.spreadsheets.values
        .get({ spreadsheetId: credentials.finesId, range: RANGES.tariffs })
        .catch(() => ({ data: { values: undefined } })),
    ]);

    const squad = parseSquadInfo((squadRes.data.values as string[][]) ?? []);
    const { attendance, rosterOrder } = parseAttendance(
      (attendanceRes.data.values as string[][]) ?? []
    );
    const fines = buildFines((finesRes.data.values as string[][]) ?? []);
    const tariffs = buildTariffs((tariffsRes.data.values as string[][]) ?? []);

    const finesByPlayer = new Map<string, number>();
    for (const fine of fines) {
      finesByPlayer.set(
        fine.player,
        (finesByPlayer.get(fine.player) ?? 0) + fine.amount
      );
    }

    const players = buildPlayers(squad, attendance, rosterOrder, finesByPlayer);

    return {
      players,
      fines,
      tariffs,
      finePotTotal: fines.reduce((sum, fine) => sum + fine.amount, 0),
      syncedAt: new Date().toISOString(),
      isPlaceholder: false,
    };
  } catch (error) {
    console.error(
      "[sheets] Sync met Google Sheet mislukt, val terug op placeholder data:",
      error
    );
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
