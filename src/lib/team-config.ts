export const teamConfig = {
  club: "v.v. Ariston '80",
  team: "H13",
  league: "8e klasse 06",
  season: "26/27",
  homeGround: {
    name: "Sportpark TU Delft, Veld 3",
    address: "Mekelweg 8, Delft",
  },
  thirdHalf: {
    name: "De TAP",
    address: "Brabantse Turfmarkt, Delft",
  },
  calendarIcsUrl:
    process.env.CALENDAR_ICS_URL ??
    "https://calendar.google.com/calendar/ical/80888c5d99065a461bd2c55cfe4f28c5269fe18e36662e2b998f1fcf4a1c7ac3%40group.calendar.google.com/public/basic.ics",
  calendarEmbedUrl:
    "https://calendar.google.com/calendar/embed?src=80888c5d99065a461bd2c55cfe4f28c5269fe18e36662e2b998f1fcf4a1c7ac3%40group.calendar.google.com&ctz=Europe%2FAmsterdam",
  showFinePot: true,
} as const;
