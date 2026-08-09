import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-navy/10 bg-white overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  aside,
}: {
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-navy/8 px-4 py-3">
      <span className="font-display text-[15px]">{title}</span>
      {aside}
    </div>
  );
}

export function CardRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-navy/6 px-4 py-3 last:border-b-0 ${className}`}
    >
      {children}
    </div>
  );
}
