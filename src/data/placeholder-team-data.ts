import type { TeamData } from "@/lib/types";

/**
 * Placeholder squad data shown until the Google Sheet integration is configured
 * (see docs/google-sheets-setup.md). Structure mirrors the columns the sync job
 * expects, so swapping in real data is a drop-in once the sheet is wired up.
 */
export const placeholderTeamData: TeamData = {
  isPlaceholder: true,
  syncedAt: null,
  players: [
    { nr: 1, name: "Thijs Brouwer", nickname: "Beer", position: "Keeper", played: 9, minutes: 810, goals: 0, assists: 0, attendancePct: 100, yellowCards: 1, redCards: 0, motm: 2, streak: 9, fines: 12.5, note: "Negen van de negen. Houdt de nul niet vaak, maar staat er wel altijd." },
    { nr: 2, name: "Sander de Wit", nickname: "Sjaak", position: "Rechtsback", played: 8, minutes: 690, goals: 0, assists: 0, attendancePct: 89, yellowCards: 2, redCards: 0, motm: 0, streak: 4, fines: 22.5, note: "Twee keer geel voor praten, nul keer voor voetballen." },
    { nr: 3, name: "Ruben Vermeulen", nickname: "Ruub", position: "Centraal achterin", played: 9, minutes: 810, goals: 0, assists: 1, attendancePct: 100, yellowCards: 3, redCards: 0, motm: 1, streak: 9, fines: 37.5, note: "Kaartenkoning van het team. Blijft volhouden dat het er twee onterecht waren." },
    { nr: 4, name: "Joost Hendriks", nickname: "Joostie", position: "Centraal achterin", played: 9, minutes: 800, goals: 5, assists: 4, attendancePct: 100, yellowCards: 1, redCards: 0, motm: 3, streak: 9, fines: 5, note: "Vijf goals vanuit het centrum, waarvan vier uit corners. Blijft die corners opeisen." },
    { nr: 5, name: "Pim van Dijk", nickname: "Pimpel", position: "Linksback", played: 7, minutes: 600, goals: 4, assists: 2, attendancePct: 78, yellowCards: 0, redCards: 0, motm: 1, streak: 3, fines: 20, note: "Komt graag op, gaat zelden terug. Werkt tot nu toe prima." },
    { nr: 6, name: "Daan Kuipers", nickname: "Kuip", position: "Controleur", played: 8, minutes: 720, goals: 3, assists: 1, attendancePct: 89, yellowCards: 2, redCards: 0, motm: 1, streak: 5, fines: 15, note: "Loopt het meest, zegt het minst." },
    { nr: 7, name: "Bram Postma", nickname: "Posty", position: "Rechtsbuiten", played: 9, minutes: 745, goals: 2, assists: 3, attendancePct: 100, yellowCards: 0, redCards: 0, motm: 0, streak: 9, fines: 0, note: "Penningmeester van de boetepot en toevallig ook de enige zonder boete." },
    { nr: 8, name: "Lars Wesseling", nickname: "Wessel", position: "Middenveld", played: 6, minutes: 430, goals: 1, assists: 0, attendancePct: 67, yellowCards: 1, redCards: 0, motm: 0, streak: 1, fines: 27.5, note: "Drie keer te laat, twee keer met een goed verhaal." },
    { nr: 9, name: "Sem Rietveld", nickname: "Riet", position: "Spits", played: 9, minutes: 780, goals: 7, assists: 3, attendancePct: 100, yellowCards: 1, redCards: 0, motm: 1, streak: 9, fines: 17.5, note: "Zeven goals uit negen wedstrijden. Viert ze allemaal alsof het de finale is." },
    { nr: 10, name: "Niels Overbeek", nickname: "Nielsie", position: "Nummer 10", played: 7, minutes: 560, goals: 1, assists: 2, attendancePct: 78, yellowCards: 0, redCards: 0, motm: 0, streak: 2, fines: 10, note: "Meer ideeën dan afronding, maar de ideeën zijn goed." },
    { nr: 11, name: "Koen van Leeuwen", nickname: "Leeuw", position: "Linksbuiten", played: 8, minutes: 640, goals: 1, assists: 1, attendancePct: 89, yellowCards: 1, redCards: 0, motm: 0, streak: 6, fines: 12.5, note: "Snelste van het team, mits voor 14:00 gewekt." },
    { nr: 12, name: "Tim de Groot", nickname: "Grootje", position: "Middenveld", played: 6, minutes: 390, goals: 0, assists: 2, attendancePct: 67, yellowCards: 0, redCards: 0, motm: 0, streak: 0, fines: 32.5, note: "Mist standaard de wedstrijd na een verenigingsborrel. Statistisch aantoonbaar." },
    { nr: 13, name: "Jasper Molenaar", nickname: "Mol", position: "Verdediger", played: 5, minutes: 310, goals: 0, assists: 1, attendancePct: 56, yellowCards: 1, redCards: 0, motm: 0, streak: 0, fines: 25, note: "Laagste opkomst van de selectie. Belooft beterschap sinds oktober." },
    { nr: 14, name: "Floris Bakker", nickname: "Flip", position: "Allrounder", played: 7, minutes: 420, goals: 0, assists: 0, attendancePct: 78, yellowCards: 0, redCards: 0, motm: 0, streak: 2, fines: 10, note: "Speelt elke positie even matig en dat is een compliment." },
  ],
  fines: [
    { date: "2026-08-01", player: "Tim de Groot", reason: "Afgemeld op vrijdagavond, 23:40", amount: 10 },
    { date: "2026-08-01", player: "Ruben Vermeulen", reason: "Geel voor commentaar op de scheids", amount: 7.5 },
    { date: "2026-07-25", player: "Lars Wesseling", reason: "Te laat (2e keer dit seizoen)", amount: 5 },
    { date: "2026-07-25", player: "Sem Rietveld", reason: "Juichen richting eigen bank na 5-2", amount: 5 },
    { date: "2026-07-18", player: "Jasper Molenaar", reason: "Verkeerd tenue meegenomen", amount: 5 },
    { date: "2026-07-11", player: "Sander de Wit", reason: "Telefoon in de kleedkamer laten afgaan", amount: 2.5 },
    { date: "2026-07-11", player: "Pim van Dijk", reason: "Panna geincasseerd", amount: 2.5 },
    { date: "2026-06-27", player: "Thijs Brouwer", reason: "Doorgeschoten uittrap over de zijlijn", amount: 2.5 },
  ],
  tariffs: [
    { reason: "Te laat verzamelen", amount: 5 },
    { reason: "Afmelden na donderdag 20:00", amount: 10 },
    { reason: "Zonder afmelding niet komen", amount: 25 },
    { reason: "Gele kaart (mond)", amount: 7.5 },
    { reason: "Rode kaart", amount: 20 },
    { reason: "Tenue vergeten", amount: 5 },
    { reason: "Panna geincasseerd", amount: 2.5 },
    { reason: "Man of the match", amount: 0 },
  ],
  finePotTotal: 247.5,
};
