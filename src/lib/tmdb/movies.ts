import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SELECTION, TMDB_LOCALE, getDecade } from "@/lib/constants";
import { tmdbFetch } from "./client";
import type {
  MovieDetails,
  MovieSummary,
  TmdbDiscoverMovie,
  TmdbMovieDetails,
  TmdbPaged,
  TmdbWatchProviders,
} from "./types";

const yearOf = (date: string) => (date ? Number(date.slice(0, 4)) : null);

const toSummary = (m: TmdbDiscoverMovie): MovieSummary => ({
  id: m.id,
  title: m.title,
  year: yearOf(m.release_date),
  posterPath: m.poster_path,
  rating: m.vote_average,
});

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
    movie = await tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, { language: TMDB_LOCALE.language });
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
