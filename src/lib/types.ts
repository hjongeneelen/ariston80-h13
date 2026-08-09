export type Venue = "Thuis" | "Uit";

export type Match = {
  id: string;
  opponent: string;
  /** ISO 8601 kickoff time */
  start: string;
  end: string | null;
  venue: Venue;
  location: string;
  /** true once the match's kickoff time is in the past */
  played: boolean;
  /** filled in once results are synced from the team sheet */
  result: MatchResult | null;
};

export type MatchResult = {
  scoreFor: number;
  scoreAgainst: number;
  outcome: "W" | "G" | "V"; // Winst / Gelijk / Verlies
  scorers: string;
};

export type Player = {
  nr: number;
  name: string;
  nickname: string;
  position: string;
  played: number;
  minutes: number;
  goals: number;
  assists: number;
  attendancePct: number;
  yellowCards: number;
  redCards: number;
  motm: number;
  streak: number;
  fines: number;
  note: string;
};

export type Fine = {
  date: string;
  player: string;
  reason: string;
  amount: number;
};

export type FineTariff = {
  reason: string;
  amount: number;
};

export type TeamData = {
  players: Player[];
  fines: Fine[];
  tariffs: FineTariff[];
  finePotTotal: number;
  /** ISO timestamp of the last successful sync from the spreadsheet */
  syncedAt: string | null;
  /** true when this is placeholder data, not yet synced from the real sheet */
  isPlaceholder: boolean;
};
