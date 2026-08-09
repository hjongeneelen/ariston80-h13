import Image from "next/image";
import { teamConfig } from "@/lib/team-config";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const hasError = params?.error === "1";
  const redirectPath = typeof params?.redirect === "string" ? params.redirect : "/";

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 py-16 text-center">
      <Image src="/brand/logo-navy.svg" alt={teamConfig.club} width={64} height={64} />
      <div>
        <div className="font-display text-2xl">
          {teamConfig.club} · {teamConfig.team}
        </div>
        <p className="mt-2 text-[14px] text-navy/60">
          Deze site is alleen voor het team. Vraag het teamwachtwoord aan de
          leiding als je die niet hebt.
        </p>
      </div>

      <form
        action="/api/login"
        method="POST"
        className="flex w-full flex-col gap-3"
      >
        <input type="hidden" name="redirect" value={redirectPath} />
        <input
          type="password"
          name="password"
          placeholder="Teamwachtwoord"
          autoFocus
          required
          className="w-full rounded-lg border border-navy/20 bg-white px-4 py-3 text-[15px] outline-none focus:border-red"
        />
        {hasError ? (
          <p className="font-mono text-[12px] text-red">
            Onjuist wachtwoord. Probeer het nog eens.
          </p>
        ) : null}
        <button
          type="submit"
          className="font-display w-full rounded-lg bg-red py-3 text-[14px] text-white"
        >
          Inloggen
        </button>
      </form>
    </div>
  );
}
