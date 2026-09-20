import { getTeamData } from "@/lib/sheets";
import { byAttendanceDesc, byStreakDesc } from "@/lib/derive";
import { StatsTable } from "@/components/stats/stats-table";

export default async function StatistiekenPage() {
  const teamData = await getTeamData();
  const attendance = byAttendanceDesc(teamData.players);
  const streaks = byStreakDesc(teamData.players, 5);

  return (
    <div className="flex flex-col gap-4">
      <StatsTable players={teamData.players} />

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="font-mono mb-2.5 text-[10px] tracking-[0.12em] text-navy/50 uppercase">
            Aanwezigheid over het seizoen
          </div>
          {attendance.map((p) => (
            <div key={p.nr} className="mb-1.5 flex items-center gap-2.5">
              <span className="w-24 flex-none truncate text-[14px]">
                {p.name.split(" ").slice(-1)[0]}
              </span>
              <span className="block h-2 flex-1 overflow-hidden rounded-full bg-navy/9">
                <span
                  className="block h-2 bg-navy-light"
                  style={{ width: `${p.attendancePct ?? 0}%` }}
                />
              </span>
              <span className="font-mono w-[34px] flex-none text-right text-[12px]">
                {p.attendancePct === null ? "–" : `${p.attendancePct}%`}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="font-mono mb-2.5 text-[10px] tracking-[0.12em] text-navy/50 uppercase">
            IJzeren mannen · streak
          </div>
          {streaks.map((p) => (
            <div
              key={p.nr}
              className="flex items-baseline gap-2.5 border-b border-navy/6 py-1.5 last:border-b-0"
            >
              <span className="flex-1 text-[15px] font-semibold">{p.name}</span>
              <span className="font-mono text-[13px] text-navy/55">
                {p.streak} op rij
              </span>
            </div>
          ))}
          <p className="mt-3 text-[13px] leading-[1.45] text-navy/50">
            Streak breekt bij één gemiste wedstrijd. Blessures, tentamens en
            bruiloften tellen gewoon mee.
          </p>
        </div>
      </div>

      {teamData.isPlaceholder ? (
        <p className="font-mono text-center text-[11px] text-navy/40">
          Statistieken zijn voorbeelddata — koppel de teamsheet om echte cijfers te tonen.
        </p>
      ) : null}
    </div>
  );
}
