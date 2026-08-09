export function StatTile({
  label,
  value,
  valueColor,
  sub,
}: {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white px-4 py-3.5">
      <div className="font-mono text-[10px] tracking-[0.12em] text-navy/50 uppercase">
        {label}
      </div>
      <div
        className="font-display mt-1 text-[30px] leading-[1.1]"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
      {sub ? <div className="text-[13px] text-navy/60">{sub}</div> : null}
    </div>
  );
}
