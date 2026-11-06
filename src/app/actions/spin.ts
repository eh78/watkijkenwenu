"use server";

import { SELECTION, getDecade, getGenre } from "@/lib/constants";
import { discoverTopRated } from "@/lib/tmdb/movies";
import type { MovieSummary } from "@/lib/tmdb/types";

export type SpinResult =
  | {
      ok: true;
      pool: MovieSummary[];
      winnerId: number;
      /** true als alle topfilms van deze combinatie al gezien waren (herhaling mogelijk). */
      exhausted: boolean;
    }
  | { ok: false; error: string };

const MAX_EXCLUDE = 500;

const randomInt = (maxExclusive: number) => Math.floor(Math.random() * maxExclusive);
const pick = <T,>(items: T[]) => items[randomInt(items.length)];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Kiest een willekeurige, nog niet geziene film uit de top 100 best beoordeelde
 * films van een decennium + genre. Geeft ook de rest van die pagina terug: die
 * posters vullen de filmrol-animatie en dienen als "volgende" bij wegswipen.
 */
export async function spin(decadeId: string, genreId: number, excludeIds: number[] = []): Promise<SpinResult> {
  if (!getDecade(decadeId) || !getGenre(genreId)) {
    return { ok: false, error: "Ongeldige keuze." };
  }
  const seen = new Set(
    (Array.isArray(excludeIds) ? excludeIds : []).filter(Number.isInteger).slice(-MAX_EXCLUDE),
  );

  try {
    let minVotes: number = SELECTION.minVoteCount;
    let first = await discoverTopRated(decadeId, genreId, 1, minVotes);

    // Niche-combinaties (bijv. Western uit de jaren '20) hebben weinig films met veel stemmen.
    if (first.totalResults < 20) {
      minVotes = SELECTION.fallbackMinVoteCount;
      first = await discoverTopRated(decadeId, genreId, 1, minVotes);
    }

    const pageCount = Math.min(SELECTION.maxPages, first.totalPages);
    if (pageCount === 0) return { ok: false, error: "Geen films gevonden voor deze combinatie." };

    // Pagina's in willekeurige volgorde proberen tot er een ongeziene film tussen zit.
    // Alle pagina's zijn gecachet, dus extra pogingen zijn goedkoop.
    let fallbackPool: MovieSummary[] = [];
    for (const page of shuffle(Array.from({ length: pageCount }, (_, i) => i + 1))) {
      const data = page === 1 ? first : await discoverTopRated(decadeId, genreId, page, minVotes);
      if (data.movies.length === 0) continue;
      if (fallbackPool.length === 0) fallbackPool = data.movies;

      const unseen = data.movies.filter((m) => !seen.has(m.id));
      if (unseen.length > 0) {
        return { ok: true, pool: shuffle(data.movies), winnerId: pick(unseen).id, exhausted: false };
      }
    }

    if (fallbackPool.length === 0) return { ok: false, error: "Geen films gevonden voor deze combinatie." };
    // Alles al gezien: kies toch, maar laat de UI weten dat het een herhaling kan zijn.
    const pool = shuffle(fallbackPool);
    return { ok: true, pool, winnerId: pick(pool).id, exhausted: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "De filmrol liep vast. Probeer het nog eens." };
  }
}
