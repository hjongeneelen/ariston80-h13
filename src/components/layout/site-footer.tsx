import { teamConfig } from "@/lib/team-config";

export function SiteFooter({ syncedLabel }: { syncedLabel?: string }) {
  const passwordProtected = Boolean(process.env.SITE_PASSWORD);

  return (
    <footer className="bg-navy px-4 py-8 pb-10 text-white/55">
      <div className="mx-auto grid max-w-[1120px] gap-3 text-[13px] leading-relaxed [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        <div>
          <div className="font-display mb-1 text-[14px] text-white">
            {teamConfig.club} · {teamConfig.team}
          </div>
          {teamConfig.homeGround.name}, {teamConfig.homeGround.address}
          <br />
          Derde helft: {teamConfig.thirdHalf.name}, {teamConfig.thirdHalf.address}
        </div>
        <div>
          Programma komt live uit de teamkalender. Statistieken, kaarten en de
          boetepot komen uit de teamsheet en worden periodiek gesynchroniseerd.
        </div>
        <div className="font-mono flex flex-col gap-2 text-[11px] tracking-[0.06em]">
          <div>
            LAATST GESYNCT
            <br />
            <span className="text-white">{syncedLabel ?? "—"}</span>
          </div>
          {passwordProtected ? (
            <form action="/api/logout" method="POST">
              <button type="submit" className="text-white/55 underline hover:text-white">
                Uitloggen
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
