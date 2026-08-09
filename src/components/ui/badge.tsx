import type { ReactNode } from "react";

const OUTCOME_COLOR: Record<"W" | "G" | "V", string> = {
  W: "#1b3c8c",
  G: "#8a8f9e",
  V: "#c8102e",
};

export function OutcomeBadge({ outcome }: { outcome: "W" | "G" | "V" }) {
  return (
    <span
      className="font-mono flex h-5 w-5 flex-none items-center justify-center rounded-[5px] text-[11px] font-bold text-white"
      style={{ background: OUTCOME_COLOR[outcome] }}
    >
      {outcome}
    </span>
  );
}

export function MonoLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-[0.12em] text-navy/50 uppercase">
      {children}
    </div>
  );
}

export function VenuePill({ venue }: { venue: "Thuis" | "Uit" }) {
  const color = venue === "Thuis" ? "#c8102e" : "#1b3c8c";
  return (
    <span
      className="font-mono flex-none rounded-full border px-2 py-[3px] text-[10px] tracking-[0.1em] uppercase"
      style={{ borderColor: color, color }}
    >
      {venue}
    </span>
  );
}
