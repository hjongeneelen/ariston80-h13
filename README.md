# Ariston '80 · H13

Team site for v.v. Ariston '80's H13 squad: live match programme (synced from
the team's Google Calendar), squad stats, and the boetepot (fine pot) —
backed by a Google Sheet that syncs in periodically once connected.

Built with Next.js 16 (App Router) + Tailwind CSS v4, following the visual
design in [`h13/Ariston'80 website design`](../h13/Ariston'80%20website%20design).

## Features

- **Home** — next fixture, season stat tiles, recent results, top scorers, derived awards.
- **Programma** — upcoming/played matches parsed live from the club's public
  `.ics` calendar feed, plus the full embedded Google Calendar for a month view.
- **Statistieken** — sortable squad stats table (totals or per-90-minutes), attendance, streaks.
- **Selectie** — expandable player cards.
- **Boetepot** — fine pot total, recent fines, tariff list.
- **Access gate** — the whole site can sit behind one shared password
  (`SITE_PASSWORD`) via `src/proxy.ts`, so the URL and this repo can stay
  public while the content stays team-only. Unset the variable to make the
  site fully open.
- **Google Sheet sync** — squad/fines data refreshes automatically every 30
  minutes once configured (see [`docs/google-sheets-setup.md`](docs/google-sheets-setup.md)),
  with an on-demand `/api/cron/sync-sheet` endpoint for immediate refreshes.
  Until it's configured, the site shows clearly-labeled placeholder data.

## Project structure

```
src/
  app/                    Routes (App Router)
    page.tsx              Home
    programma/            Fixtures + results + embedded calendar
    statistieken/         Squad stats table
    selectie/             Player cards
    boetepot/             Fine pot
    login/                Shared-password gate
    api/
      login/, logout/     Sets/clears the access-gate cookie
      cron/sync-sheet/    Forces an immediate Google Sheet re-sync
  components/
    layout/               Header, nav, footer
    ui/                    Small shared primitives (card, badge, stat tile)
    stats/, selectie/      Feature-specific components
  lib/                     Calendar parsing, Sheets client, formatting, config
  data/                    Placeholder squad/fines data
  proxy.ts                 Shared-password gate (runs before every request)
docs/                      Setup guides
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See [`.env.example`](.env.example) for the full list. At minimum:

- `CALENDAR_ICS_URL` — already defaults to the team's public calendar feed.
- Everything else (`GOOGLE_*`, `CRON_SECRET`, `SITE_PASSWORD`) is optional —
  the site works with placeholder squad data and no password gate until
  you set them.

To connect the real squad/fines spreadsheet, follow
[`docs/google-sheets-setup.md`](docs/google-sheets-setup.md).

## Deployment

Deploys cleanly to [Vercel](https://vercel.com) (`vercel.json` already
includes a daily cron trigger for the sheet sync) or any Node.js host via
`npm run build && npm run start`. Set the environment variables from
`.env.example` on whichever platform you use.

## Tech notes

- Next.js 16 renamed Middleware to **Proxy** (`src/proxy.ts`, same
  functionality) — that's what implements the password gate.
- Calendar events are parsed with [`node-ical`](https://www.npmjs.com/package/node-ical);
  recurring events are expanded, and the opponent/venue are inferred
  heuristically from the event summary and location.
- Google Sheets access uses [`googleapis`](https://www.npmjs.com/package/googleapis)
  with a read-only service account — no OAuth login flow needed.
