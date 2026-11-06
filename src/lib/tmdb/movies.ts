import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { NO_FILTERS, SELECTION, TMDB_LOCALE, getDecade, type ExclusionFilters } from "@/lib/constants";
import { tmdbFetch } from "./client";
import type {
  MovieDetails,
  MovieSummary,
  TmdbDiscoverMovie,
  TmdbMovieDetails,
  TmdbPaged,
  TmdbWatchProviders,
} from "./types";

/** Aantal hoofdrolspelers op de filmpagina. */
const CAST_LIMIT = 5;

const yearOf = (date: string) => (date ? Number(date.slice(0, 4)) : null);

const toSummary = (m: TmdbDiscoverMovie): MovieSummary => ({
  id: m.id,
  title: m.title,
  year: yearOf(m.release_date),
  posterPath: m.poster_path,
  rating: m.vote_average,
});

/** Alle taal- en landcodes die TMDB kent (verandert zelden). */
async function getAllCodes() {
  "use cache";
  cacheLife("weeks");
  const [languages, countries] = await Promise.all([
    tmdbFetch<{ iso_639_1: string }[]>("/configuration/languages"),
    tmdbFetch<{ iso_3166_1: string }[]>("/configuration/countries"),
  ]);
  return { languages: languages.map((l) => l.iso_639_1), countries: countries.map((c) => c.iso_3166_1) };
}

/**
 * TMDB kan talen en landen niet uitsluiten, alleen insluiten (meerdere waarden met "|").
 * Uitsluiten = alle andere codes insluiten.
 */
async function exclusionParams(filters: ExclusionFilters) {
  if (filters.languages.length === 0 && filters.countries.length === 0) return {};
  const all = await getAllCodes();
  const complement = (codes: string[], exclude: string[]) => codes.filter((c) => !exclude.includes(c)).join("|");
  return {
    with_original_language: filters.languages.length ? complement(all.languages, filters.languages) : undefined,
    with_origin_country: filters.countries.length ? complement(all.countries, filters.countries) : undefined,
  };
}

/**
 * Eén pagina (20 films) uit de best beoordeelde films van een decennium + genre.
 * Gecachet per combinatie van argumenten; het willekeurig kiezen gebeurt
 * daarna (in de Server Action), dus caching maakt de uitkomst niet voorspelbaar.
 */
export async function discoverTopRated(
  decadeId: string,
  genreId: number,
  page: number,
  minVoteCount: number = SELECTION.minVoteCount,
  filters: ExclusionFilters = NO_FILTERS,
) {
  "use cache";
  cacheLife("days");
  cacheTag("tmdb-discover");

  const decade = getDecade(decadeId);
  if (!decade) throw new Error(`Onbekend decennium: ${decadeId}`);

  const data = await tmdbFetch<TmdbPaged<TmdbDiscoverMovie>>("/discover/movie", {
    language: TMDB_LOCALE.language,
    sort_by: "vote_average.desc",
    "vote_count.gte": minVoteCount,
    "vote_average.gte": SELECTION.minRating,
    "primary_release_date.gte": decade.from,
    "primary_release_date.lte": decade.to,
    with_genres: genreId,
    include_adult: false,
    include_video: false,
    page,
    ...(await exclusionParams(filters)),
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    // Zonder poster is een film onbruikbaar voor de filmrol.
    movies: data.results.filter((m) => m.poster_path).map(toSummary),
  };
}

/** Details voor de resultaatpagina, met Engelse terugval voor een lege beschrijving. */
export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`tmdb-movie-${id}`);

  let movie: TmdbMovieDetails;
  try {
    movie = await tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, {
      language: TMDB_LOCALE.language,
      append_to_response: "credits",
    });
  } catch (e) {
    if (e instanceof Error && "status" in e && e.status === 404) return null;
    throw e;
  }

  let { overview, tagline } = movie;
  if (!overview) {
    const en = await tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, { language: TMDB_LOCALE.fallbackLanguage });
    overview = en.overview;
    tagline ||= en.tagline;
  }

  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    year: yearOf(movie.release_date),
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    overview,
    tagline,
    runtime: movie.runtime,
    genres: movie.genres.map((g) => g.name),
    imdbId: movie.imdb_id,
    directors: (movie.credits?.crew ?? []).filter((c) => c.job === "Director").map((c) => c.name),
    cast: (movie.credits?.cast ?? [])
      .sort((a, b) => a.order - b.order)
      .slice(0, CAST_LIMIT)
      .map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path })),
  };
}

/**
 * v2 — Waar te zien in Nederland (streamen / huren / kopen).
 * Data van JustWatch via TMDB; bij weergave is bronvermelding verplicht.
 */
export async function getWatchProviders(id: number): Promise<TmdbWatchProviders | null> {
  "use cache";
  cacheLife("hours");

  const data = await tmdbFetch<{ results: Record<string, TmdbWatchProviders> }>(`/movie/${id}/watch/providers`);
  return data.results[TMDB_LOCALE.region] ?? null;
}
