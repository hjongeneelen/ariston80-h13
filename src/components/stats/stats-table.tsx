"use client";

import { useMemo, useState } from "react";
import type { Player } from "@/lib/types";

type SortKey = "w" | "min" | "g" | "a" | "ga" | "aanw" | "motm";

const SORT_LABELS: Record<SortKey, string> = {
  ga: "G+A",
  g: "goals",
  a: "assists",
  w: "wedstrijden",
  min: "minuten",
  aanw: "aanwezigheid",
  motm: "MOTM",
};

function perNinety(value: number, minutes: number): string {
  if (minutes <= 0) return "0.00";
  return ((value * 90) / minutes).toFixed(2);
}

export function StatsTable({ players }: { players: Player[] }) {
  // Which stats are actually tracked? The sheets don't record goals/assists/
  // minutes/cards, so hide those columns instead of showing fake zeros.
  const has = useMemo(
    () => ({
      played: players.some((p) => p.played > 0),
      minutes: players.some((p) => p.minutes > 0),
      goals: players.some((p) => p.goals > 0),
      assists: players.some((p) => p.assists > 0),
      motm: players.some((p) => p.motm > 0),
      cards: players.some((p) => p.yellowCards + p.redCards > 0),
      attendance: players.some((p) => p.attendancePct !== null),
    }),
    [players]
  );

  const anyScoring = has.goals || has.assists;
  const [sort, setSort] = useState<SortKey>(anyScoring ? "ga" : "aanw");
  const [perNinetyMode, setPerNinetyMode] = useState(false);

  const ALL_COLUMNS: { key: SortKey; label: string }[] = [
    { key: "w", label: "W" },
    { key: "min", label: "Min" },
    { key: "g", label: "Goals" },
    { key: "a", label: "Ass" },
    { key: "ga", label: "G+A" },
    { key: "aanw", label: "Aanw" },
    { key: "motm", label: "MOTM" },
  ];
  const columns = ALL_COLUMNS.filter((col) => {
    switch (col.key) {
      case "w":
        return has.played;
      case "min":
        return has.minutes;
      case "g":
        return has.goals;
      case "a":
        return has.assists;
      case "ga":
        return anyScoring;
      case "motm":
        return has.motm;
      case "aanw":
        return has.attendance;
      default:
        return true;
    }
  });

  const rows = useMemo(() => {
    const sorted = players.slice().sort((a, b) => {
      switch (sort) {
        case "ga":
          return b.goals + b.assists - (a.goals + a.assists) || b.goals - a.goals;
        case "aanw":
          return (b.attendancePct ?? -1) - (a.attendancePct ?? -1);
        case "motm":
          return b.motm - a.motm;
        case "g":
          return b.goals - a.goals;
        case "a":
          return b.assists - a.assists;
        case "w":
          return b.played - a.played;
        case "min":
          return b.minutes - a.minutes;
        default:
          return 0;
      }
    });

    return sorted.map((p, i) => ({
      rank: i + 1,
      player: p,
      goals: perNinetyMode ? perNinety(p.goals, p.minutes) : String(p.goals),
      assists: perNinetyMode ? perNinety(p.assists, p.minutes) : String(p.assists),
      ga: perNinetyMode
        ? perNinety(p.goals + p.assists, p.minutes)
        : String(p.goals + p.assists),
    }));
  }, [players, sort, perNinetyMode]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {anyScoring ? (
          <button
            type="button"
            onClick={() => setPerNinetyMode((v) => !v)}
            className="font-mono rounded-full border border-navy/20 bg-white px-3 py-2 text-[11px] tracking-[0.1em] text-navy uppercase hover:border-red hover:text-red"
          >
            {perNinetyMode ? "Per 90 minuten" : "Totalen"}
          </button>
        ) : null}
        <span className="font-mono text-[11px] text-navy/45">
          Tik op een kolomkop om te sorteren · nu op {SORT_LABELS[sort]}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
        <table className="w-full min-w-[660px] border-collapse">
          <thead>
            <tr className="bg-navy text-white">
              <th className="py-2.5 pr-2 pl-4 text-left font-mono text-[10px] font-normal tracking-[0.1em] text-white/60 uppercase">
                #
              </th>
              <th className="py-2.5 px-2 text-left font-mono text-[10px] font-normal tracking-[0.1em] text-white/60 uppercase">
                Speler
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => setSort(col.key)}
                  className="cursor-pointer py-2.5 px-2 text-right font-mono text-[10px] font-normal tracking-[0.1em] text-white/75 uppercase hover:text-white"
                >
                  {col.label}
                </th>
              ))}
              {has.cards ? (
                <th className="py-2.5 pr-4 pl-2 text-right font-mono text-[10px] font-normal tracking-[0.1em] text-white/60 uppercase">
                  Krt
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ rank, player, goals, assists, ga }) => (
              <tr key={player.nr} className="border-b border-navy/7 last:border-b-0 hover:bg-navy/3">
                <td className="font-mono py-2.5 pr-2 pl-4 text-[12px] text-navy/40">{rank}</td>
                <td className="py-2.5 px-2 text-[15px] font-semibold whitespace-nowrap">
                  {player.name}{" "}
                  {player.nickname ? (
                    <span className="text-[13px] font-normal text-navy/45">
                      &quot;{player.nickname}&quot;
                    </span>
                  ) : null}
                </td>
                {columns.some((c) => c.key === "w") ? (
                  <td className="font-mono py-2.5 px-2 text-right text-[13px]">{player.played}</td>
                ) : null}
                {columns.some((c) => c.key === "min") ? (
                  <td className="font-mono py-2.5 px-2 text-right text-[13px] text-navy/60">
                    {player.minutes}
                  </td>
                ) : null}
                {columns.some((c) => c.key === "g") ? (
                  <td className="font-mono py-2.5 px-2 text-right text-[14px] font-bold text-red">
                    {goals}
                  </td>
                ) : null}
                {columns.some((c) => c.key === "a") ? (
                  <td className="font-mono text-navy-light py-2.5 px-2 text-right text-[14px] font-bold">
                    {assists}
                  </td>
                ) : null}
                {columns.some((c) => c.key === "ga") ? (
                  <td className="font-mono py-2.5 px-2 text-right text-[13px]">{ga}</td>
                ) : null}
                {columns.some((c) => c.key === "aanw") ? (
                  <td className="font-mono py-2.5 px-2 text-right text-[13px]">
                    {player.attendancePct === null ? "–" : `${player.attendancePct}%`}
                  </td>
                ) : null}
                {columns.some((c) => c.key === "motm") ? (
                  <td className="font-mono py-2.5 px-2 text-right text-[13px]">{player.motm}</td>
                ) : null}
                {has.cards ? (
                  <td className="font-mono py-2.5 pr-4 pl-2 text-right text-[12px] text-navy/55">
                    {player.yellowCards}G
                    {player.redCards ? ` · ${player.redCards}R` : ""}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
