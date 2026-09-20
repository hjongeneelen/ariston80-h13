# Wiring up the team spreadsheets

The site reads **two real Google Sheets** (read-only, via a service account) and
shows only the data they actually track — squad, positions, notes, attendance
% and streaks, and fines. Match stats (goals/assists/minutes/cards) aren't
tracked anywhere, so the UI hides those columns.

Until the service account is configured the site shows clearly-labeled
placeholder data.

## 1. Create a Google Cloud service account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create
   (or reuse) a project.
2. Enable the **Google Sheets API** for that project.
3. Go to **IAM & Admin → Service Accounts → Create service account**. Any name is
   fine, e.g. `ariston-h13-sync`. No roles are required.
4. Open the new service account → **Keys → Add key → Create new key → JSON**.
   Download the JSON file — it contains `client_email` and `private_key`, which
   map to `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` below.

## 2. Share both spreadsheets

The sync reads two spreadsheets. Open each and share it with the service
account's email (`...@...iam.gserviceaccount.com`) as **Viewer** (read-only):

| Spreadsheet | ID | Tabs used |
| ----------- | -- | --------- |
| **H13 gegevens** | `1wPkyUTwR5Oe5_btgv471ZtF8d5_PVnkxLsy6SiC_7jw` | `H13 spelerslijst`, `Aanwezigheid jaar 4` |
| **H13 Boetesoverzicht 2026/27** | `135sB8PWUA41O7TYV5VWhAQpDzl2qwAtltKOgyjHJ0xg` | `Boetes` (+ optional `Tarieven`) |

## 3. Expected tabs and columns

`src/lib/sheet-parsers.ts` maps these layouts (pure, unit-testable):

- **`H13 spelerslijst`** — `Naam | Been | Tap 1 | Tap 2 | Tap 3 | teamjaars | jaars | Commentaar`.
  Position is built from the non-empty Tap columns (`Tap 1 · Tap 2 · Tap 3`),
  `Commentaar` becomes the player note.
- **`Aanwezigheid jaar 4`** — row 1 is `Speler | <match header> | … | Aanw. %`,
  then one row per player with `Ja`/`Nee` per match (blank = not decided yet).
  The sync computes each player's attendance % (`Ja / (Ja+Nee)`) and their
  current streak (consecutive `Ja` counting back from the most recent decided
  match).
- **`Boetes`** — `Datum | Speler | Reden | Bedrag (€) | Opmerkingen`. Amounts may
  be `€1` / `€ 12,50`; dates `15/09/2026` are normalized to ISO.
- **`Tarieven`** (optional, in the Boetes spreadsheet) — `Reden | Bedrag (€)`.
  If the tab is absent, a built-in fallback tariff list is shown.

The **active squad is pinned** in `ACTIVE_ROSTER` in `sheet-parsers.ts` (the 22
players). Extra names that linger in the sheets — rustend/injured members and
leenplayers — are intentionally excluded. Update `ACTIVE_ROSTER` when the squad
changes.

## 4. Set the environment variables

Locally, copy `.env.example` to `.env.local` and fill in:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=ariston-h13-sync@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="[REDACTED PRIVATE KEY]\n"
GOOGLE_SHEET_ID=1wPkyUTwR5Oe5_btgv471ZtF8d5_PVnkxLsy6SiC_7jw
GOOGLE_FINES_SHEET_ID=135sB8PWUA41O7TYV5VWhAQpDzl2qwAtltKOgyjHJ0xg
```

`GOOGLE_PRIVATE_KEY` keeps its `\n` escapes — `src/lib/sheets.ts` un-escapes
them at read time, so paste the key as one line, quoted. `GOOGLE_FINES_SHEET_ID`
is optional and defaults to `GOOGLE_SHEET_ID` if you keep everything in one sheet.

On Vercel (or whichever host), add the same variables under
**Project Settings → Environment Variables**.

## 5. Forcing an immediate re-sync

The cache refreshes automatically every 30 minutes. To force it sooner (e.g.
right after entering Saturday's results or a new fine), call:

```
curl -X POST "https://<your-domain>/api/cron/sync-sheet" \
  -H "Authorization: Bearer ***"
```

`vercel.json` also schedules a daily call to this endpoint (Vercel's Hobby
plan caps cron jobs at once per day; bump the schedule if you're on Pro).
Vercel automatically sends `CRON_SECRET` as the bearer token for its own
scheduled invocations — just make sure the env var is set.

## 6. Testing the parsers

Without a service account you can still validate parsing against the real
sheets using your own OAuth token (read-only):

```
npx tsx scripts/test-sheets-sync.ts
```

It reads `GOOGLE_TOKEN_PATH` (defaults to Hermes' `google_token.json`) and prints
the parsed squad/fines without writing anything.
