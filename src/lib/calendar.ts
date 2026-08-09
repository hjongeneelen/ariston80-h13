import ical, { type VEvent } from "node-ical";
import { teamConfig } from "./team-config";
import type { Match, Venue } from "./types";

const WINDOW_DAYS_PAST = 120;
const WINDOW_DAYS_FUTURE = 240;
const SUMMARY_SEPARATORS = [" - ", " – ", " vs ", " v. ", " v ", ": "];

/** node-ical returns plain strings, or `{ val, params }` when the ICS property carries parameters. */
function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "val" in value) {
    return String((value as { val: unknown }).val ?? "");
  }
  return "";
}

function normalizeForMatching(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isHomeVenue(location: string, summary: string, homeSide: string | null): Venue {
  const haystack = normalizeForMatching(`${location} ${summary}`);
  if (haystack.includes("thuis")) return "Thuis";
  if (haystack.includes("uit")) return "Uit";
  if (haystack.includes("tudelft") || haystack.includes("mekelweg")) return "Thuis";
  // KNVB Sportlink exports list the home side first in "Team A - Team B".
  if (homeSide && /ariston/i.test(homeSide)) return "Thuis";
  return "Uit";
}

/**
 * Splits a fixture summary like "Ariston'80 13 - Vitesse Delft 6" into the
 * side that mentions our club and the opponent's side. Returns null for
 * calendar entries that aren't fixtures at all (club events, socials, etc.),
 * which don't follow this "Team A - Team B" shape.
 */
function splitFixtureSummary(summary: string): { homeSide: string; opponent: string } | null {
  const clean = summary.trim();
  for (const sep of SUMMARY_SEPARATORS) {
    if (!clean.includes(sep)) continue;
    const [first, ...rest] = clean.split(sep).map((side) => side.trim());
    const second = rest.join(sep).trim();
    if (!first || !second) continue;
    const ownSide = /ariston/i.test(first) ? first : /ariston/i.test(second) ? second : null;
    if (!ownSide) continue;
    const opponentRaw = ownSide === first ? second : first;
    const opponent = opponentRaw.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (!opponent) continue;
    return { homeSide: first, opponent };
  }
  return null;
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(teamConfig.calendarIcsUrl, {
    // Google Calendar feeds update infrequently; 30 min keeps the site fresh
    // without hammering the feed on every request.
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Kalender ophalen mislukt: ${res.status} ${res.statusText}`);
  }

  const icsText = await res.text();
  const parsed = ical.sync.parseICS(icsText);

  const now = new Date();
  const from = new Date(now.getTime() - WINDOW_DAYS_PAST * 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + WINDOW_DAYS_FUTURE * 24 * 60 * 60 * 1000);

  const matches: Match[] = [];

  for (const component of Object.values(parsed)) {
    if (!component || component.type !== "VEVENT") continue;
    const event = component as VEvent;

    const instances = ical.expandRecurringEvent(event, { from, to });

    for (const instance of instances) {
      // Full-day entries in this feed are club events (trainings, socials,
      // committee meetings) rather than fixtures, which always carry a
      // kickoff time — skip them.
      if (instance.isFullDay) continue;

      const summary = textValue(instance.summary) || "Wedstrijd";
      const fixture = splitFixtureSummary(summary);
      // Not a "Team A - Team B" fixture summary — not a match, skip it.
      if (!fixture) continue;

      const location = textValue(instance.event.location);
      const venue = isHomeVenue(location, summary, fixture.homeSide);

      matches.push({
        id: `${event.uid}-${instance.start.toISOString()}`,
        opponent: fixture.opponent,
        start: instance.start.toISOString(),
        end: instance.end ? instance.end.toISOString() : null,
        venue,
        location: location || (venue === "Thuis" ? teamConfig.homeGround.name : ""),
        played: instance.start.getTime() < now.getTime(),
        result: null,
      });
    }
  }

  return matches.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function nextMatch(matches: Match[]): Match | null {
  return matches.find((m) => !m.played) ?? null;
}

export function recentResults(matches: Match[], count: number): Match[] {
  return matches
    .filter((m) => m.played)
    .slice()
    .reverse()
    .slice(0, count);
}

export function upcomingMatches(matches: Match[]): Match[] {
  return matches.filter((m) => !m.played);
}

export function playedMatches(matches: Match[]): Match[] {
  return matches.filter((m) => m.played).slice().reverse();
}
