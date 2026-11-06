import type { ImageLoaderProps } from "next/image";

/**
 * TMDB image-helpers. Bewust NIET server-only: posters worden ook in
 * client components (de filmrol) getoond.
 */
const IMAGE_BASE = "https://image.tmdb.org/t/p";

const POSTER_SIZES = [92, 154, 185, 342, 500, 780] as const;
const BACKDROP_SIZES = [300, 780, 1280] as const;

export type PosterSize = `w${(typeof POSTER_SIZES)[number]}` | "original";
export type BackdropSize = `w${(typeof BACKDROP_SIZES)[number]}` | "original";

const PROFILE_SIZES = [45, 185] as const;
const LOGO_SIZES = [45, 92, 154, 185, 300] as const;

export const posterUrl = (path: string, size: PosterSize = "w500") => `${IMAGE_BASE}/${size}${path}`;
export const backdropUrl = (path: string, size: BackdropSize = "w1280") => `${IMAGE_BASE}/${size}${path}`;

/**
 * Loader voor next/image: kiest het kleinste TMDB-formaat dat breed genoeg is.
 * `src` is het TMDB-pad, bijv. "/abc123.jpg".
 */
export function tmdbPosterLoader({ src, width }: ImageLoaderProps) {
  const size = POSTER_SIZES.find((s) => s >= width);
  return posterUrl(src, size ? `w${size}` : "original");
}

export function tmdbBackdropLoader({ src, width }: ImageLoaderProps) {
  const size = BACKDROP_SIZES.find((s) => s >= width);
  return backdropUrl(src, size ? `w${size}` : "original");
}

export function tmdbProfileLoader({ src, width }: ImageLoaderProps) {
  const size = PROFILE_SIZES.find((s) => s >= width);
  return `${IMAGE_BASE}/${size ? `w${size}` : "h632"}${src}`;
}

export function tmdbLogoLoader({ src, width }: ImageLoaderProps) {
  const size = LOGO_SIZES.find((s) => s >= width);
  return `${IMAGE_BASE}/${size ? `w${size}` : "original"}${src}`;
}

/** Publieke TMDB-pagina van een film. */
export const tmdbMovieUrl = (id: number) => `https://www.themoviedb.org/movie/${id}`;
