import "server-only";

/**
 * Minimale Radarr v3 API-client (werkt met Radarr v3, v4 en v5).
 * Draait alleen op de server: de API-sleutel komt nooit in de browser.
 */

export interface RadarrConnection {
  url: string;
  apiKey: string;
}

export interface RadarrConfig extends RadarrConnection {
  qualityProfileId: number;
  rootFolderPath: string;
  searchOnAdd: boolean;
}

export interface RadarrQualityProfile {
  id: number;
  name: string;
}

export interface RadarrRootFolder {
  id: number;
  path: string;
  freeSpace?: number;
  accessible?: boolean;
}

interface RadarrMovie {
  id?: number;
  title: string;
  tmdbId: number;
  titleSlug?: string;
  hasFile?: boolean;
  monitored?: boolean;
  [key: string]: unknown;
}

export class RadarrError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "RadarrError";
  }
}

/** Normaliseert de door de gebruiker ingevoerde URL (alleen http/https, geen trailing slash). */
export function normalizeRadarrUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new RadarrError("Ongeldige URL. Gebruik bijvoorbeeld http://192.168.1.10:7878");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RadarrError("De URL moet met http:// of https:// beginnen.");
  }
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

async function request<T>(conn: RadarrConnection, path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${conn.url}/api/v3${path}`, {
      ...init,
      headers: { "X-Api-Key": conn.apiKey, "Content-Type": "application/json", Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch {
    throw new RadarrError(
      `Radarr is niet bereikbaar op ${conn.url}. Draait Radarr, en kan de server van deze app dat adres bereiken?`,
    );
  }

  if (res.status === 401) throw new RadarrError("De API-sleutel klopt niet (Radarr → Settings → General → API Key).", 401);
  if (!res.ok) {
    // Radarr geeft bij validatiefouten een lijst [{ errorMessage }] terug.
    const body = await res.json().catch(() => null);
    const detail = Array.isArray(body) ? body.map((e) => e?.errorMessage).filter(Boolean).join(" ") : body?.message;
    throw new RadarrError(detail || `Radarr gaf foutcode ${res.status}.`, res.status);
  }
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new RadarrError("Onverwacht antwoord. Klopt de URL (zonder /api erachter)?");
  }
}

/** Test de verbinding en haalt de keuzes op die nodig zijn om films toe te voegen. */
export async function inspectRadarr(conn: RadarrConnection) {
  const status = await request<{ version: string; appName?: string }>(conn, "/system/status");
  const [qualityProfiles, rootFolders] = await Promise.all([
    request<RadarrQualityProfile[]>(conn, "/qualityprofile"),
    request<RadarrRootFolder[]>(conn, "/rootfolder"),
  ]);
  return {
    version: status.version,
    qualityProfiles: qualityProfiles.map(({ id, name }) => ({ id, name })),
    rootFolders: rootFolders.map(({ id, path, freeSpace, accessible }) => ({ id, path, freeSpace, accessible })),
  };
}

export type RadarrMovieState = "missing" | "monitored" | "unmonitored" | "downloaded";

/** Staat de film al in Radarr, en zo ja: is hij al gedownload? */
export async function getMovieState(conn: RadarrConnection, tmdbId: number) {
  const movies = await request<RadarrMovie[]>(conn, `/movie?tmdbId=${tmdbId}`);
  const movie = movies.find((m) => m.tmdbId === tmdbId);
  if (!movie) return { state: "missing" as const, link: null };
  const state: RadarrMovieState = movie.hasFile ? "downloaded" : movie.monitored ? "monitored" : "unmonitored";
  return { state, link: `${conn.url}/movie/${movie.titleSlug ?? tmdbId}` };
}

/** Voegt een film toe aan Radarr op basis van het TMDB-ID. */
export async function addMovie(config: RadarrConfig, tmdbId: number) {
  const lookup = await request<RadarrMovie>(config, `/movie/lookup/tmdb?tmdbId=${tmdbId}`);
  const added = await request<RadarrMovie>(config, "/movie", {
    method: "POST",
    body: JSON.stringify({
      ...lookup,
      qualityProfileId: config.qualityProfileId,
      rootFolderPath: config.rootFolderPath,
      monitored: true,
      minimumAvailability: "released",
      addOptions: { searchForMovie: config.searchOnAdd },
    }),
  });
  return { link: `${config.url}/movie/${added.titleSlug ?? tmdbId}` };
}
