/**
 * End-to-end test of the sheet sync parsers against the REAL H13 spreadsheets,
 * using the user's OAuth token (same data the deployed service account would read).
 *
 * Run: npx tsx scripts/test-sheets-sync.ts
 *
 * It only READS the sheets — no writes. Verifies that parseSquadInfo /
 * parseAttendance / buildFines / buildPlayers produce sensible TeamData.
 */
import { google } from "googleapis";
import fs from "fs";
import os from "os";
import path from "path";
import {
  buildFines,
  buildPlayers,
  buildTariffs,
  parseAttendance,
  parseSquadInfo,
} from "../src/lib/sheet-parsers";

const GEGEVENS_ID = "1wPkyUTwR5Oe5_btgv471ZtF8d5_PVnkxLsy6SiC_7jw";
const FINES_ID = "135sB8PWUA41O7TYV5VWhAQpDzl2qwAtltKOgyjHJ0xg";

async function main() {
  const tokenPath =
    process.env.GOOGLE_TOKEN_PATH ||
    path.join(os.homedir(), "AppData", "Local", "hermes", "google_token.json");
  const tok = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

  const oauth = new google.auth.OAuth2(tok.client_id, tok.client_secret);
  oauth.setCredentials({
    refresh_token: tok.refresh_token,
    access_token: tok.token,
  });
  const sheets = google.sheets({ version: "v4", auth: oauth });

  const get = (id: string, range: string) =>
    sheets.spreadsheets.values
      .get({ spreadsheetId: id, range })
      .then((r) => (r.data.values as string[][]) ?? []);

  const [squadRows, attRows, fineRows, tariffRows] = await Promise.all([
    get(GEGEVENS_ID, "'H13 spelerslijst'!A2:H200"),
    get(GEGEVENS_ID, "'Aanwezigheid jaar 4'!A1:Z200"),
    get(FINES_ID, "Boetes!A2:E200"),
    get(FINES_ID, "Tarieven!A2:B100").catch(() => [] as string[][]),
  ]);

  const squad = parseSquadInfo(squadRows);
  const { attendance, rosterOrder } = parseAttendance(attRows);
  const fines = buildFines(fineRows);
  const tariffs = buildTariffs(tariffRows);

  const finesByPlayer = new Map<string, number>();
  for (const f of fines)
    finesByPlayer.set(f.player, (finesByPlayer.get(f.player) ?? 0) + f.amount);

  const players = buildPlayers(squad, attendance, rosterOrder, finesByPlayer);
  const finePotTotal = fines.reduce((s, f) => s + f.amount, 0);

  console.log(`Squad: ${players.length} players`);
  for (const p of players) {
    console.log(
      `  ${String(p.nr).padStart(2)} ${p.name.padEnd(22)} pos="${p.position || "—"}"` +
        `  aanw=${p.attendancePct ?? "–"}%  streak=${p.streak}  fines=€${p.fines}` +
        (p.note ? `  note="${p.note.slice(0, 40)}"` : "")
    );
  }

  console.log(`\nFines: ${fines.length}`);
  for (const f of fines)
    console.log(`  ${f.date}  ${f.player.padEnd(20)} €${f.amount}  ${f.reason}`);
  console.log(`Fine pot total: €${finePotTotal}`);

  console.log(`\nTariffs: ${tariffs.length} (${tariffs.length > 0 && tariffs[0].reason ? "from sheet" : "fallback"})`);

  // Basic sanity checks
  const known = [
    "Sander Boer", "Joep ten Dam", "Nathan Overvelde", "Jesse de Vries", "Olaf Fenger",
    "Mattis Hilgeman", "Twan Struis", "Hugo Jongeneelen", "Guus Rekers", "Steyn Hoving",
    "Karel Hamburg", "Daan Sieben", "Rens van Lierop", "Erik Kint", "Daan van Ravestein",
    "Wessel Hogenboom", "Jeroen Leenders", "Wout van Kollenburg", "Lars Koolwijk",
    "Duco Trompert", "Niels van Hout", "Silvester Molenaar",
  ];
  const names = new Set(players.map((p) => p.name));
  const missing = known.filter((n) => !names.has(n));
  const extra = players.filter((p) => !known.includes(p.name)).map((p) => p.name);
  console.log(`\nSanity — known roster: ${known.length}, missing: ${missing.length} ${missing.join(",") || ""}`);
  if (extra.length) console.log(`Unexpected extra players: ${extra.join(", ")}`);
}

main().catch((e) => {
  console.error("TEST FAILED:", e);
  process.exit(1);
});
