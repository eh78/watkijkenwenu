import { DECADES, type DecadeTheme } from "@/lib/constants";

/** Leidt het decennium-thema af van een jaartal (voor de resultaatpagina). */
export function themeForYear(year: number | null): DecadeTheme {
  if (!year) return "clean";
  const decade = DECADES.findLast((d) => year >= Number(d.id));
  return decade?.theme ?? "seventies";
}
