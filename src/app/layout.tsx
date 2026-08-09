import type { Metadata } from "next";
import { Archivo_Black, Barlow, Space_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { teamConfig } from "@/lib/team-config";
import { getTeamData } from "@/lib/sheets";
import { formatSyncedAt } from "@/lib/format";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${teamConfig.club} · ${teamConfig.team}`,
  description: `Programma, statistieken en selectie van ${teamConfig.club} ${teamConfig.team}, ${teamConfig.league} · seizoen ${teamConfig.season}.`,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const teamData = await getTeamData();

  return (
    <html
      lang="nl"
      className={`${archivoBlack.variable} ${barlow.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-navy">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-4 pb-16">
          {children}
        </main>
        <SiteFooter syncedLabel={formatSyncedAt(teamData.syncedAt)} />
      </body>
    </html>
  );
}
