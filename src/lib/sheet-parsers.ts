import type { Fine, FineTariff, Player } from "./types";

/**
 * Pure parsers for the H13 spreadsheets — no I/O, no Next.js imports, so they
 * can be unit-tested in isolation (see scripts/test-sheets-sync.ts).
 *
 * Real sheet layouts:
 *  - 'H13 spelerslijst': Naam | Been | Tap 1 | Tap 2 | Tap 3 | teamjaars | jaars | Commentaar
 *  - 'Aanwezigheid jaar 4': row 1 = [Speler, <match>, ..., 'Aanw. %'], then Ja/Nee per player
 *  - 'Boetes': Datum | Speler | Reden | Bedrag (€) | Opmerkingen
 *  - 'Tarieven' (optional): Reden | Bedrag (€)
 */

export function norm(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/** '€1', '€ 12,50', '7.5' → 1, 12.5, 7.5 */
export function parseEuroAmount(value: unknown): number {
  const s = String(value ?? "").replace(/[€\s]/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** '15/09/2026' → '2026-09-15' (also accepts D/M/YYYY, dots/dashes, ISO). */
export function parseDateToIso(value: unknown): string {
  const s = norm(value);
  if (!s) return "";
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  return s;
}

export type SquadInfo = {
  positions: string[];
  note: string;
};

/**
 * The active squad, in display order. The sheets have extra names that are NOT
 * part of the squad: rustend/injured members (e.g. Ben van Velzen, Ersan Korucu,
 * Reno Welleman) and leenplayers — they can linger in the spelerslijst or the
 * attendance matrix. Pinning the roster keeps the site to exactly these 22.
 * Update this list when the squad changes.
 */
export const ACTIVE_ROSTER: string[] = [
  "Sander Boer",
  "Joep ten Dam",
  "Nathan Overvelde",
  "Jesse de Vries",
  "Olaf Fenger",
  "Mattis Hilgeman",
  "Twan Struis",
  "Hugo Jongeneelen",
  "Guus Rekers",
  "Steyn Hoving",
  "Karel Hamburg",
  "Daan Sieben",
  "Rens van Lierop",
  "Erik Kint",
  "Daan van Ravestein",
  "Wessel Hogenboom",
  "Jeroen Leenders",
  "Wout van Kollenburg",
  "Lars Koolwijk",
  "Duco Trompert",
  "Niels van Hout",
  "Silvester Molenaar",
];

/** Tab 'H13 spelerslijst': Naam | Been | Tap 1 | Tap 2 | Tap 3 | teamjaars | jaars | Commentaar */
export function parseSquadInfo(rows: string[][]): Map<string, SquadInfo> {
  const squad = new Map<string, SquadInfo>();
  for (const row of rows) {
    const name = norm(row[0]);
    if (!name || squad.has(name)) continue;
    squad.set(name, {
      positions: [norm(row[2]), norm(row[3]), norm(row[4])].filter(Boolean),
      note: norm(row[7]),
    });
  }
  return squad;
}

export type Attendance = {
  ja: number;
  nee: number;
  pct: number | null;
  streak: number;
};

/**
 * Tab 'Aanwezigheid jaar 4': row 1 = ['Speler', <match header>, ..., 'Aanw. %'],
 * then one row per player with 'Ja'/'Nee' per match (blank = not decided yet).
 * Returns attendance per player + roster order (the matrix's player order).
 */
export function parseAttendance(rows: string[][]) {
  const attendance = new Map<string, Attendance>();
  if (rows.length === 0) return { attendance, rosterOrder: [] as string[] };

  const header = rows[0];
  const matchCols: number[] = [];
  for (let j = 1; j < header.length; j++) {
    const h = norm(header[j]).toLowerCase();
    if (!h) continue;
    if (h.startsWith("aanw")) break; // 'Aanw. %' summary column
    matchCols.push(j);
  }

  const rosterOrder: string[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = norm(row[0]);
    if (!name) continue;
    let ja = 0;
    let nee = 0;
    for (const j of matchCols) {
      const v = norm(row[j]).toLowerCase();
      if (v === "ja") ja++;
      else if (v === "nee") nee++;
    }
    // streak: consecutive 'Ja' counting back from the most recent decided match
    let streak = 0;
    for (let k = matchCols.length - 1; k >= 0; k--) {
      const v = norm(row[matchCols[k]]).toLowerCase();
      if (v === "ja") streak++;
      else if (v === "nee") break;
    }
    attendance.set(name, {
      ja,
      nee,
      pct: ja + nee > 0 ? Math.round((ja / (ja + nee)) * 100) : null,
      streak,
    });
    rosterOrder.push(name);
  }
  return { attendance, rosterOrder };
}

/** Tab 'Boetes': Datum | Speler | Reden | Bedrag (€) | Opmerkingen */
export function buildFines(rows: string[][]): Fine[] {
  const fines: Fine[] = [];
  for (const row of rows) {
    const player = norm(row[1]);
    if (!player) continue;
    const amount = parseEuroAmount(row[3]);
    if (amount <= 0) continue;
    fines.push({
      date: parseDateToIso(row[0]),
      player,
      reason: norm(row[2]),
      amount,
    });
  }
  return fines;
}

/** Fine tariffs shown until (or if) the Boetes sheet gets a 'Tarieven' tab. */
export const TARIFF_FALLBACK: FineTariff[] = [
  { reason: "Te laat verzamelen", amount: 5 },
  { reason: "Afmelden na donderdag 20:00", amount: 10 },
  { reason: "Zonder afmelding niet komen", amount: 25 },
  { reason: "Gele kaart (mond)", amount: 7.5 },
  { reason: "Rode kaart", amount: 20 },
  { reason: "Tenue vergeten", amount: 5 },
  { reason: "Panna geincasseerd", amount: 2.5 },
  { reason: "Man of the match", amount: 0 },
];

export function buildTariffs(rows: string[][]): FineTariff[] {
  const tariffs: FineTariff[] = [];
  for (const row of rows) {
    const reason = norm(row[0]);
    if (!reason) continue;
    tariffs.push({ reason, amount: parseEuroAmount(row[1]) });
  }
  return tariffs.length > 0 ? tariffs : TARIFF_FALLBACK;
}

export function buildPlayers(
  squad: Map<string, SquadInfo>,
  attendance: Map<string, Attendance>,
  rosterOrder: string[],
  finesByPlayer: Map<string, number>
): Player[] {
  // The squad is the pinned active roster, enriched from the sheets. Fall back
  // to the attendance-matrix order ∩ spelerslijst if the roster is ever empty.
  const names =
    ACTIVE_ROSTER.length > 0
      ? ACTIVE_ROSTER
      : rosterOrder.filter((n) => squad.has(n));

  return names.map((name, i) => {
    const info = squad.get(name);
    const att = attendance.get(name);
    return {
      nr: i + 1,
      name,
      nickname: "",
      position: info?.positions.join(" · ") ?? "",
      played: att?.ja ?? 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      attendancePct: att?.pct ?? null,
      yellowCards: 0,
      redCards: 0,
      motm: 0,
      streak: att?.streak ?? 0,
      fines: finesByPlayer.get(name) ?? 0,
      note: info?.note ?? "",
    };
  });
}
