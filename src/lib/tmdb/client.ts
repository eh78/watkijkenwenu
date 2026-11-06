import "server-only";

const API_BASE = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

/**
 * Minimale fetch-wrapper voor TMDB. Draait alleen op de server zodat de
 * token nooit in de browser belandt. Caching gebeurt een laag hoger met
 * `'use cache'` in movies.ts.
 */
export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    throw new TmdbError("TMDB_READ_TOKEN ontbreekt. Kopieer .env.example naar .env.local en vul je token in.");
  }

  const url = new URL(API_BASE + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  if (res.status === 404) throw new TmdbError("Niet gevonden", 404);
  if (!res.ok) throw new TmdbError(`TMDB-fout ${res.status} bij ${path}`, res.status);

  return res.json() as Promise<T>;
}
