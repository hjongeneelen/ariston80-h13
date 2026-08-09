import { fetchMatches, playedMatches, upcomingMatches } from "@/lib/calendar";
import { teamConfig } from "@/lib/team-config";
import { formatDayNumber, formatMatchTime, formatMonthShort } from "@/lib/format";
import { Card, CardHeader, CardRow } from "@/components/ui/card";
import { VenuePill } from "@/components/ui/badge";
import type { Match } from "@/lib/types";

function MatchDate({ iso }: { iso: string }) {
  return (
    <div className="w-14 flex-none text-center">
      <div className="font-display text-[18px] leading-none">{formatDayNumber(iso)}</div>
      <div className="font-mono text-[10px] tracking-[0.1em] text-navy/45 uppercase">
        {formatMonthShort(iso)}
      </div>
    </div>
  );
}

export default async function ProgrammaPage() {
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    matches = await fetchMatches();
  } catch (e) {
    console.error("[programma] Kalender ophalen mislukt:", e);
    error =
      "De kalender kon niet worden geladen. Controleer de CALENDAR_ICS_URL instelling.";
  }

  const komend = upcomingMatches(matches);
  const gespeeld = playedMatches(matches);

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-xl border border-red/30 bg-white px-4 py-3 text-[14px] text-red">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader title="Komende wedstrijden" />
        {komend.length === 0 ? (
          <p className="px-4 py-4 text-[14px] text-navy/55">
            Geen komende wedstrijden in de kalender.
          </p>
        ) : (
          komend.map((m) => (
            <CardRow key={m.id}>
              <MatchDate iso={m.start} />
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-semibold">{m.opponent}</div>
                <div className="text-[13px] text-navy/55">
                  {formatMatchTime(m.start)}
                  {m.location ? ` · ${m.location}` : ""}
                </div>
              </div>
              <VenuePill venue={m.venue} />
            </CardRow>
          ))
        )}
      </Card>

      <Card>
        <CardHeader title="Gespeeld" />
        {gespeeld.length === 0 ? (
          <p className="px-4 py-4 text-[14px] text-navy/55">
            Nog geen wedstrijden gespeeld dit seizoen.
          </p>
        ) : (
          gespeeld.map((m) => (
            <CardRow key={m.id}>
              <MatchDate iso={m.start} />
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-semibold">{m.opponent}</div>
                <div className="text-[13px] text-navy/55">
                  {m.location || (m.venue === "Thuis" ? "Thuis" : "Uit")}
                </div>
              </div>
              <VenuePill venue={m.venue} />
            </CardRow>
          ))
        )}
      </Card>

      <Card>
        <CardHeader title="Volledige kalender" />
        <div className="p-3">
          <iframe
            src={teamConfig.calendarEmbedUrl}
            style={{ border: 0 }}
            width="100%"
            height={600}
            title="Google Agenda — volledige kalender"
          />
        </div>
      </Card>
    </div>
  );
}
