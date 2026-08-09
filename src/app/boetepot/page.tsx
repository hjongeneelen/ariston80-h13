import { notFound } from "next/navigation";
import { getTeamData } from "@/lib/sheets";
import { teamConfig } from "@/lib/team-config";
import { formatEuro, formatMatchDate } from "@/lib/format";
import { Card, CardHeader, CardRow } from "@/components/ui/card";

export default async function BoetepotPage() {
  if (!teamConfig.showFinePot) notFound();

  const teamData = await getTeamData();

  return (
    <div className="flex flex-col gap-4">
      <section className="grid items-center gap-4 rounded-2xl bg-red p-6 text-white [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-white/72 uppercase">
            Stand van de pot
          </div>
          <div className="font-display mt-1.5 text-[clamp(38px,9vw,60px)] leading-none">
            {formatEuro(teamData.finePotTotal)}
          </div>
        </div>
        <p className="text-[15px] leading-[1.5] text-white/88">
          Wordt uitgegeven aan het einde van het seizoen in {teamConfig.thirdHalf.name}.
        </p>
      </section>

      <Card>
        <CardHeader title="Recente boetes" />
        {teamData.fines.length === 0 ? (
          <p className="px-4 py-4 text-[14px] text-navy/55">Nog geen boetes geregistreerd.</p>
        ) : (
          teamData.fines.map((fine, i) => (
            <CardRow key={`${fine.date}-${fine.player}-${i}`}>
              <span className="font-mono w-[52px] flex-none text-[11px] text-navy/40">
                {formatMatchDate(fine.date)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">{fine.player}</div>
                <div className="text-[13px] text-navy/55">{fine.reason}</div>
              </div>
              <span className="font-mono flex-none text-[14px] font-bold">
                {formatEuro(fine.amount)}
              </span>
            </CardRow>
          ))
        )}
      </Card>

      <div className="rounded-xl border border-navy/10 bg-white p-4">
        <div className="font-mono mb-2.5 text-[10px] tracking-[0.12em] text-navy/50 uppercase">
          Tarieven
        </div>
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {teamData.tariffs.map((tariff) => (
            <div
              key={tariff.reason}
              className="flex justify-between gap-2.5 border-b border-navy/6 py-1.5 text-[14px] last:border-b-0"
            >
              <span>{tariff.reason}</span>
              <span className="font-mono font-bold">{formatEuro(tariff.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {teamData.isPlaceholder ? (
        <p className="font-mono text-center text-[11px] text-navy/40">
          Boetepot is voorbeelddata — koppel de teamsheet om de echte stand te tonen.
        </p>
      ) : null}
    </div>
  );
}
