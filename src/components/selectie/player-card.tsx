"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";

export function PlayerCard({ player }: { player: Player }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="rounded-xl border border-navy/10 bg-white px-4 py-3.5 text-left hover:border-navy/28"
    >
      <div className="flex items-center gap-3">
        <span className="font-display flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-navy text-[15px] text-white">
          {player.nr}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold leading-tight">{player.name}</div>
          <div className="text-[13px] text-navy/50">
            &quot;{player.nickname}&quot; · {player.position}
          </div>
        </div>
        <span className="font-mono text-[11px] text-navy/40">{open ? "—" : "+"}</span>
      </div>

      {open ? (
        <div className="mt-3 grid grid-cols-4 gap-2.5 border-t border-navy/8 pt-3">
          <Stat label="Wed" value={String(player.played)} />
          <Stat label="Goals" value={String(player.goals)} color="var(--color-red)" />
          <Stat label="Ass" value={String(player.assists)} color="var(--color-navy-light)" />
          <Stat label="Aanw" value={`${player.attendancePct}%`} />
          <p className="col-span-4 mt-1 text-[13.5px] leading-[1.45] text-navy/62">
            {player.note}
          </p>
        </div>
      ) : null}
    </button>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.1em] text-navy/45 uppercase">
        {label}
      </div>
      <div className="font-display text-[19px]" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
