import type { Player } from "./types";

type PlayerWithAttendance = Player & { attendancePct: number };

function withAttendance(players: Player[]): PlayerWithAttendance[] {
  return players.filter(
    (p): p is PlayerWithAttendance => p.attendancePct !== null
  );
}

export function topScorers(players: Player[], count: number) {
  return players
    .slice()
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, count);
}

export function averageAttendance(players: Player[]): number {
  const withData = withAttendance(players);
  if (withData.length === 0) return 0;
  const total = withData.reduce((sum, p) => sum + p.attendancePct, 0);
  return Math.round(total / withData.length);
}

export function totalGoals(players: Player[]): number {
  return players.reduce((sum, p) => sum + p.goals, 0);
}

export function byAttendanceDesc(players: Player[]) {
  return players
    .slice()
    .sort((a, b) => (b.attendancePct ?? -1) - (a.attendancePct ?? -1));
}

export function byStreakDesc(players: Player[], count: number) {
  return players
    .slice()
    .sort((a, b) => b.streak - a.streak)
    .slice(0, count);
}

export type Award = {
  title: string;
  playerName: string;
  reason: string;
};

/** Fun, deterministic "awards" derived from whatever squad data is currently loaded. */
export function deriveAwards(players: Player[]): Award[] {
  if (players.length === 0) return [];

  const awards: Award[] = [];

  const withData = withAttendance(players);
  if (withData.length > 0) {
    const ironMan = withData
      .slice()
      .sort((a, b) => b.attendancePct - a.attendancePct || b.streak - a.streak)[0];
    awards.push({
      title: "IJzeren man",
      playerName: ironMan.name,
      reason: `${ironMan.attendancePct}% aanwezigheid, ${ironMan.streak} op rij.`,
    });

    const ghost = withData
      .slice()
      .sort((a, b) => a.attendancePct - b.attendancePct)[0];
    if (ghost.nr !== ironMan.nr) {
      awards.push({
        title: "Spookspeler",
        playerName: ghost.name,
        reason: `${ghost.attendancePct}% aanwezigheid, de laagste van de selectie.`,
      });
    }
  }

  const motmLeader = players.slice().sort((a, b) => b.motm - a.motm)[0];
  if (motmLeader.motm > 0) {
    awards.push({
      title: "Man of the match-klassement",
      playerName: motmLeader.name,
      reason: `${motmLeader.motm}× verkozen tot man of the match.`,
    });
  }

  const cardKing = players
    .slice()
    .sort((a, b) => b.yellowCards + b.redCards * 2 - (a.yellowCards + a.redCards * 2))[0];
  const cardTotal = cardKing.yellowCards + cardKing.redCards;
  if (cardTotal > 0) {
    awards.push({
      title: "Kaartenkoning",
      playerName: cardKing.name,
      reason: `${cardKing.yellowCards} gele${cardKing.redCards ? ` en ${cardKing.redCards} rode` : ""} kaart${cardTotal > 1 ? "en" : ""} dit seizoen.`,
    });
  }

  return awards;
}
