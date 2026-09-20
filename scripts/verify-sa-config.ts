/**
 * Verifies the deployed sync path against the real spreadsheets using the
 * SERVICE ACCOUNT credentials from .env.local — the exact same JWT auth the
 * site uses (src/lib/sheets.ts). Run: npx tsx scripts/verify-sa-config.ts
 */
import { google } from "googleapis";
import fs from "fs";
import {
  buildFines,
  buildPlayers,
  buildTariffs,
  parseAttendance,
  parseSquadInfo,
} from "../src/lib/sheet-parsers";

function loadEnv(): Record<string, string> {
  const text = fs.readFileSync(".env.local", "utf8");
  const env: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = env.GOOGLE_PRIVATE_KEY;
  const gegevensId = env.GOOGLE_SHEET_ID;
  const finesId = env.GOOGLE_FINES_SHEET_ID || gegevensId;
  if (!email || !rawKey || !gegevensId) {
    console.error("Missing GOOGLE_* vars in .env.local");
    process.exit(2);
  }

  const auth = new google.auth.JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const get = (id: string, range: string) =>
    sheets.spreadsheets.values
      .get({ spreadsheetId: id, range })
      .then((r) => (r.data.values as string[][]) ?? []);
  const getOpt = (id: string, range: string) =>
    get(id, range).catch(() => [] as string[][]);

  const [squadRows, attRows, fineRows, tariffRows] = await Promise.all([
    get(gegevensId, "'H13 spelerslijst'!A2:H200"),
    get(gegevensId, "'Aanwezigheid jaar 4'!A1:Z200"),
    get(finesId, "Boetes!A2:E200"),
    getOpt(finesId, "Tarieven!A2:B100"),
  ]);

  const squad = parseSquadInfo(squadRows);
  const { attendance, rosterOrder } = parseAttendance(attRows);
  const fines = buildFines(fineRows);
  const tariffs = buildTariffs(tariffRows);
  const finesByPlayer = new Map<string, number>();
  for (const f of fines)
    finesByPlayer.set(f.player, (finesByPlayer.get(f.player) ?? 0) + f.amount);
  const players = buildPlayers(squad, attendance, rosterOrder, finesByPlayer);
  const pot = fines.reduce((s, f) => s + f.amount, 0);

  console.log(`✅ SA AUTH + READ OK — ${email}`);
  console.log(
    `players=${players.length}  fines=${fines.length}  finePot=€${pot}  tariffs=${tariffs.length}`
  );
  console.log(`sample: ${players[0].name} | ${players[0].position} | ${players[0].attendancePct}%`);
}

main().catch((e) => {
  console.error("❌ SA VERIFY FAILED:", e?.message ?? e);
  process.exit(1);
});