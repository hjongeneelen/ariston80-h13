import { getTeamData } from "@/lib/sheets";
import { PlayerCard } from "@/components/selectie/player-card";

export default async function SelectiePage() {
  const teamData = await getTeamData();
  const players = teamData.players.slice().sort((a, b) => a.nr - b.nr);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-3 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {players.map((player) => (
          <PlayerCard key={player.nr} player={player} />
        ))}
      </div>

      {teamData.isPlaceholder ? (
        <p className="font-mono text-center text-[11px] text-navy/40">
          Selectie is voorbeelddata — koppel de teamsheet om de echte selectie te tonen.
        </p>
      ) : null}
    </div>
  );
}
