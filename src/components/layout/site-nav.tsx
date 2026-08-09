"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { teamConfig } from "@/lib/team-config";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/programma", label: "Programma" },
  { href: "/statistieken", label: "Statistieken" },
  { href: "/selectie", label: "Selectie" },
  ...(teamConfig.showFinePot ? [{ href: "/boetepot", label: "Boetepot" }] : []),
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-full max-w-[1120px] gap-0.5 overflow-x-auto px-2">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative px-3 pt-2.5 pb-3 text-sm font-semibold tracking-[0.02em] whitespace-nowrap ${
              isActive ? "text-white opacity-100" : "text-white opacity-[0.62] hover:opacity-100"
            }`}
          >
            {link.label}
            {isActive ? (
              <span className="absolute bottom-1 left-2 right-2 h-[3px] rounded bg-red" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
