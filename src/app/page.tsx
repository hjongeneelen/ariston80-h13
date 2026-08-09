import Link from "next/link";
import { fetchMatches, nextMatch, playedMatches } from "@/lib/calendar";
import { getTeamData } from "@/lib/sheets";
import { averageAttendance, deriveAwards, topScorers, totalGoals } from "@/lib/derive";
import { teamConfig } from "@/lib/team-config";
import {
  daysUntil,
  formatEuro,
  formatMatchDate,
  formatMatchTime,
} from "@/lib/format";
import { Card, CardHeader, CardRow } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { VenuePill } from "@/components/ui/badge";
import type { Match } from "@/lib/types";

export default async function HomePage() {
  const teamData = await getTeamData();

  let matches: Match[] = [];
  let calendarError = false;
  try {
    matches = await fetchMatches();
  } catch (error) {
    console.error("[home] Kalender ophalen mislukt:", error);
    calendarError = true;
  }

  const next = nextMatch(matches);
  const lastPlayed = playedMatches(matches).slice(0, 4);
  const scorers = topScorers(teamData.players, 5);
  const awards = deriveAwards(teamData.players);

  return (
    <div className="flex flex-col gap-4">
      <section className="relative overflow-hidden rounded-2xl bg-navy text-white">
        <div
          className="absolute inset-y-0 left-0 w-4"
          style={{
            background:
              "repeating-linear-gradient(180deg, #c8102e 0 22px, #1b3c8c 22px 44px)",
          }}
        />
        <div className="grid gap-5 px-8 py-6 pl-8 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {next ? (
            <>
              <div>
                <div className="font-mono text-[11px] tracking-[0.14em] text-pink uppercase">
                  Volgende wedstrijd · {daysUntil(next.start)}
                </div>
                <div className="font-display mt-2.5 text-[clamp(30px,7vw,52px)] leading-[0.98] tracking-[-0.02em]">
                  {teamConfig.club} {teamConfig.team}
                </div>
                <div className="my-0.5 text-[clamp(18px,4vw,26px)] font-semibold text-white/50">
                  tegen
                </div>
                <div className="font-display text-[clamp(30px,7vw,52px)] leading-[0.98] tracking-[-0.02em]">
                  {next.opponent}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2.5">
                <span className="font-mono rounded-full bg-red px-2.5 py-1 text-[11px] tracking-[0.12em] uppercase">
                  {next.venue}
                </span>
                <div className="font-mono text-[clamp(22px,5vw,30px)] font-bold tracking-[-0.01em]">
                  {formatMatchDate(next.start)} · {formatMatchTime(next.start)}
                </div>
                {next.location ? (
                  <div className="text-[15px] text-white/72">{next.location}</div>
                ) : null}
              </div>
            </>
          ) : calendarError ? (
            <p className="text-white/80">
              De kalender kon niet worden geladen. Controleer{" "}
              <code className="font-mono">CALENDAR_ICS_URL</code>.
            </p>
          ) : (
            <p className="text-white/80">Geen geplande wedstrijden gevonden.</p>
          )}
        </div>
      </section>

      <section className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <StatTile label="Gespeeld" value={String(playedMatches(matches).length)} />
        <StatTile
          label="Goals dit seizoen"
          value={String(totalGoals(teamData.players))}
          valueColor="var(--color-red)"
        />
        <StatTile label="Opkomst" value={`${averageAttendance(teamData.players)}%`} />
        {teamConfig.showFinePot ? (
          <StatTile label="Boetepot" value={formatEuro(teamData.finePotTotal)} />
        ) : null}
      </section>

      <section className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        <Card>
          <CardHeader
            title="Laatste wedstrijden"
            aside={
              <Link href="/programma" className="font-mono text-[11px] text-navy/45">
                heel programma →
              </Link>
            }
          />
          {lastPlayed.length === 0 ? (
            <p className="px-4 py-4 text-[14px] text-navy/55">
              Nog geen gespeelde wedstrijden in de kalender.
            </p>
          ) : (
            lastPlayed.map((m) => (
              <CardRow key={m.id}>
                <span className="font-mono w-[52px] flex-none text-[11px] text-navy/45">
                  {formatMatchDate(m.start)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                  {m.opponent}
                </span>
                <VenuePill venue={m.venue} />
              </CardRow>
            ))
          )}
        </Card>

        <Card>
          <CardHeader title="Topscorers" />
          {scorers.length === 0 ? (
            <p className="px-4 py-4 text-[14px] text-navy/55">
              Nog geen speler-statistieken gesynchroniseerd.
            </p>
          ) : (
            scorers.map((p, i) => (
              <CardRow key={p.nr}>
                <span className="font-mono w-4 flex-none text-[12px] text-navy/40">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                  {p.name}
                </span>
                <span className="text-[13px] text-navy/50">{p.assists} assists</span>
                <span className="font-display w-[26px] flex-none text-right text-[17px] text-red">
                  {p.goals}
                </span>
              </CardRow>
            ))
          )}
        </Card>
      </section>

      {awards.length > 0 ? (
        <section className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {awards.map((award) => (
            <div key={award.title} className="flex flex-col gap-1 rounded-xl bg-navy p-4 text-white">
              <span className="font-mono text-[10px] tracking-[0.12em] text-pink uppercase">
                {award.title}
              </span>
              <span className="font-display text-[20px] leading-[1.15]">
                {award.playerName}
              </span>
              <span className="text-[13px] leading-[1.35] text-white/60">{award.reason}</span>
            </div>
          ))}
        </section>
      ) : null}

      {teamData.isPlaceholder ? (
        <p className="font-mono text-center text-[11px] text-navy/40">
          Statistieken zijn voorbeelddata — koppel de teamsheet om echte cijfers te tonen.
        </p>
      ) : null}
    </div>
  );
}
