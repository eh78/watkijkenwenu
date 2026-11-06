"use server";

import { SELECTION, getDecade, getGenre } from "@/lib/constants";
import { discoverTopRated } from "@/lib/tmdb/movies";
import type { MovieSummary } from "@/lib/tmdb/types";

export type SpinResult =
  | { ok: true; pool: MovieSummary[]; winnerId: number }
  | { ok: false; error: string };

const randomInt = (maxExclusive: number) => Math.floor(Math.random() * maxExclusive);

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Kiest een willekeurige film uit de top 100 best beoordeelde films van een
 * decennium + genre. Geeft ook de rest van de pagina terug: die posters vullen
 * de filmrol-animatie en dienen als "volgende" bij wegswipen.
 */
export async function spin(decadeId: string, genreId: number): Promise<SpinResult> {
  if (!getDecade(decadeId) || !getGenre(genreId)) {
    return { ok: false, error: "Ongeldige keuze." };
  }

  try {
    let minVotes: number = SELECTION.minVoteCount;
    let first = await discoverTopRated(decadeId, genreId, 1, minVotes);

    // Niche-combinaties (bijv. Western uit de jaren '20) hebben weinig films met veel stemmen.
    if (first.totalResults < 20) {
      minVotes = SELECTION.fallbackMinVoteCount;
      first = await discoverTopRated(decadeId, genreId, 1, minVotes);
    }

    const pages = Math.min(SELECTION.maxPages, first.totalPages);
    if (pages === 0) return { ok: false, error: "Geen films gevonden voor deze combinatie." };

    const page = randomInt(pages) + 1;
    const data = page === 1 ? first : await discoverTopRated(decadeId, genreId, page, minVotes);
    if (data.movies.length === 0) return { ok: false, error: "Geen films gevonden voor deze combinatie." };

    const pool = shuffle(data.movies);
    return { ok: true, pool, winnerId: pool[randomInt(pool.length)].id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "De filmrol liep vast. Probeer het nog eens." };
  }
}
