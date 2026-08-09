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

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "w", label: "W" },
  { key: "min", label: "Min" },
  { key: "g", label: "Goals" },
  { key: "a", label: "Ass" },
  { key: "ga", label: "G+A" },
  { key: "aanw", label: "Aanw" },
  { key: "motm", label: "MOTM" },
];

function perNinety(value: number, minutes: number): string {
  if (minutes <= 0) return "0.00";
  return ((value * 90) / minutes).toFixed(2);
}

export function StatsTable({ players }: { players: Player[] }) {
  const [sort, setSort] = useState<SortKey>("ga");
  const [perNinetyMode, setPerNinetyMode] = useState(false);

  const rows = useMemo(() => {
    const sorted = players.slice().sort((a, b) => {
      switch (sort) {
        case "ga":
          return b.goals + b.assists - (a.goals + a.assists) || b.goals - a.goals;
        case "aanw":
          return b.attendancePct - a.attendancePct;
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
        <button
          type="button"
          onClick={() => setPerNinetyMode((v) => !v)}
          className="font-mono rounded-full border border-navy/20 bg-white px-3 py-2 text-[11px] tracking-[0.1em] text-navy uppercase hover:border-red hover:text-red"
        >
          {perNinetyMode ? "Per 90 minuten" : "Totalen"}
        </button>
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
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => setSort(col.key)}
                  className="cursor-pointer py-2.5 px-2 text-right font-mono text-[10px] font-normal tracking-[0.1em] text-white/75 uppercase hover:text-white"
                >
                  {col.label}
                </th>
              ))}
              <th className="py-2.5 pr-4 pl-2 text-right font-mono text-[10px] font-normal tracking-[0.1em] text-white/60 uppercase">
                Krt
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ rank, player, goals, assists, ga }) => (
              <tr key={player.nr} className="border-b border-navy/7 last:border-b-0 hover:bg-navy/3">
                <td className="font-mono py-2.5 pr-2 pl-4 text-[12px] text-navy/40">{rank}</td>
                <td className="py-2.5 px-2 text-[15px] font-semibold whitespace-nowrap">
                  {player.name}{" "}
                  <span className="text-[13px] font-normal text-navy/45">
                    &quot;{player.nickname}&quot;
                  </span>
                </td>
                <td className="font-mono py-2.5 px-2 text-right text-[13px]">{player.played}</td>
                <td className="font-mono py-2.5 px-2 text-right text-[13px] text-navy/60">
                  {player.minutes}
                </td>
                <td className="font-mono py-2.5 px-2 text-right text-[14px] font-bold text-red">
                  {goals}
                </td>
                <td className="font-mono text-navy-light py-2.5 px-2 text-right text-[14px] font-bold">
                  {assists}
                </td>
                <td className="font-mono py-2.5 px-2 text-right text-[13px]">{ga}</td>
                <td className="font-mono py-2.5 px-2 text-right text-[13px]">
                  {player.attendancePct}%
                </td>
                <td className="font-mono py-2.5 px-2 text-right text-[13px]">{player.motm}</td>
                <td className="font-mono py-2.5 pr-4 pl-2 text-right text-[12px] text-navy/55">
                  {player.yellowCards}G
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
