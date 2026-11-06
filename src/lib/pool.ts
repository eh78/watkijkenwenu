import type { MovieSummary } from "@/lib/tmdb/types";

/**
 * De pool van de laatste spin wordt in sessionStorage bewaard, zodat de
 * resultaatpagina bij wegswipen direct een volgende film kan tonen zonder
 * nieuwe TMDB-call. Alleen client-side gebruiken.
 */
const KEY = "wkwn:pool";

export interface StoredPool {
  decadeId: string;
  genreId: number;
  movies: MovieSummary[];
  seen: number[];
}

export function savePool(pool: StoredPool) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(pool));
  } catch {
    /* privémodus / quota: swipen valt dan terug op opnieuw draaien */
  }
}

export function loadPool(): StoredPool | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredPool) : null;
  } catch {
    return null;
  }
}

/** Markeert `currentId` als gezien en geeft de volgende ongeziene film terug. */
export function nextFromPool(currentId: number): MovieSummary | null {
  const pool = loadPool();
  if (!pool) return null;
  const seen = new Set([...pool.seen, currentId]);
  const next = pool.movies.find((m) => !seen.has(m.id)) ?? null;
  if (next) seen.add(next.id);
  savePool({ ...pool, seen: [...seen] });
  return next;
}

const RESPIN_KEY = "wkwn:respin";

/** Vraagt de startpagina om bij terugkeer direct opnieuw te draaien. */
export function requestRespin() {
  try {
    sessionStorage.setItem(RESPIN_KEY, "1");
  } catch {
    /* zonder sessionStorage kiest de gebruiker gewoon zelf opnieuw */
  }
}

/** Leest én wist het respin-verzoek (eenmalig). */
export function consumeRespin(): boolean {
  try {
    const requested = sessionStorage.getItem(RESPIN_KEY) === "1";
    sessionStorage.removeItem(RESPIN_KEY);
    return requested;
  } catch {
    return false;
  }
}
