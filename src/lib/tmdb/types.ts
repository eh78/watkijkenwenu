/** Ruwe TMDB-responses (alleen de velden die we gebruiken). */
export interface TmdbDiscoverMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
}

export interface TmdbPaged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string;
  release_date: string;
  runtime: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  imdb_id: string | null;
}

/** v2: /movie/{id}/watch/providers → results.NL */
export interface TmdbWatchProviders {
  link: string;
  flatrate?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
}

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

/** Genormaliseerde vormen die de UI gebruikt. */
export interface MovieSummary {
  id: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  rating: number;
}

export interface MovieDetails extends MovieSummary {
  originalTitle: string;
  overview: string;
  tagline: string;
  runtime: number | null;
  backdropPath: string | null;
  genres: string[];
  voteCount: number;
  imdbId: string | null;
}
