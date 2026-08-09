import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "./site-nav";
import { teamConfig } from "@/lib/team-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b-4 border-red bg-navy text-white">
      <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/brand/logo-white.svg"
            alt={teamConfig.club}
            width={44}
            height={44}
            className="flex-none"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-display text-[17px] leading-none tracking-[-0.01em]">
              {teamConfig.club} · {teamConfig.team}
            </span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-white/60 uppercase">
              {teamConfig.league} · seizoen {teamConfig.season}
            </span>
          </span>
        </Link>
      </div>
      <SiteNav />
    </header>
  );
}
