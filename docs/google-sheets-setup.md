# Wiring up the team spreadsheet

The site shows placeholder squad/fines data (clearly labeled as such) until this is
configured. Once wired up, `src/lib/sheets.ts` reads real data on a cache that
refreshes automatically every 30 minutes, with an on-demand sync endpoint for
right after a match.

## 1. Create a Google Cloud service account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create
   (or reuse) a project.
2. Enable the **Google Sheets API** for that project.
3. Go to **IAM & Admin → Service Accounts → Create service account**. Any name is
   fine, e.g. `ariston-h13-sync`. No roles are required.
4. Open the new service account → **Keys → Add key → Create new key → JSON**.
   Download the JSON file — it contains `client_email` and `private_key`, which
   map to `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` below.

## 2. Share the spreadsheet

Open the Google Sheet (or the Excel file, if it's stored in Drive and opened
with Google Sheets) and share it with the service account's email address
(`...@...iam.gserviceaccount.com`) as **Viewer**. The sync only reads data.

> If the file is a genuine `.xlsx` sitting in Drive rather than a native
> Google Sheet, open it once in Google Sheets ("Open with Google Sheets") and
> share that — the Sheets API only reads native Google Sheets, not raw Excel
> files. Alternatively we can switch the integration to the Drive API's
> `files.export` endpoint and parse the `.xlsx` with a library like `xlsx` —
> ask once we know which of the two it actually is.

## 3. Expected tabs and columns

`src/lib/sheets.ts` currently expects three tabs (adjust the ranges in that
file once the real sheet's layout is known — this is a starting point, not a
fixed contract):

| Tab       | Columns (A → …)                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `Players` | nr, name, nickname, position, played, minutes, goals, assists, attendancePct, yellowCards, redCards, motm, streak, fines, note |
| `Fines`   | date, player, reason, amount                                                                              |
| `Tariffs` | reason, amount                                                                                             |

Row 1 is treated as a header row and skipped (ranges start at row 2).

## 4. Set the environment variables

Locally, copy `.env.example` to `.env.local` and fill in:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=ariston-h13-sync@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=the-id-from-the-sheet-url
```

The sheet ID is the long string in the sheet's URL:
`https://docs.google.com/spreadsheets/d/<THIS PART>/edit`.

`GOOGLE_PRIVATE_KEY` keeps its `\n` escapes — `src/lib/sheets.ts` un-escapes
them at read time, so paste the key as one line, quoted.

On Vercel (or whichever host), add the same three variables under
**Project Settings → Environment Variables**.

## 5. Forcing an immediate re-sync

The cache refreshes automatically every 30 minutes. To force it sooner (e.g.
right after entering Saturday's results), call:

```
curl -X POST "https://<your-domain>/api/cron/sync-sheet" \
  -H "Authorization: Bearer $CRON_SECRET"
```

`vercel.json` also schedules a daily call to this endpoint (Vercel's Hobby
plan caps cron jobs at once per day; bump the schedule if you're on Pro).
Vercel automatically sends `CRON_SECRET` as the bearer token for its own
scheduled invocations — just make sure the env var is set.
