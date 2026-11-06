import { Suspense } from "react";
import Link from "next/link";
import { SettingsLink } from "@/components/ui/SettingsLink";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { tmdbMovieUrl } from "@/lib/tmdb/images";
import { themeForYear } from "@/lib/theme";
import type { MovieDetails } from "@/lib/tmdb/types";
import { CastList } from "./CastList";
import { MarkSeen } from "./MarkSeen";
import { PickActions } from "./PickActions";
import { RadarrButton } from "./RadarrButton";
import { SwipeablePoster } from "./SwipeablePoster";
import { WatchProviders, WatchProvidersSkeleton } from "./WatchProviders";

const formatRuntime = (min: number) => `${Math.floor(min / 60)}u ${min % 60}m`;

export function MovieHero({ movie }: { movie: MovieDetails }) {
  return (
    <main data-theme={themeForYear(movie.year)} className="theme-surface flex flex-1 flex-col overflow-hidden">
      <MarkSeen id={movie.id} />
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-muted/30 px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
        >
          <span aria-hidden>←</span> Startscherm
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden font-display text-2xl tracking-wide text-fg/80 hover:text-fg sm:block">
            Wat kijken we nu?
          </Link>
          <SettingsLink />
        </div>
      </nav>
      {movie.backdropPath && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <TmdbImage path={movie.backdropPath} kind="backdrop" alt="" fill sizes="100vw" className="scale-110 object-cover opacity-30 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-6 py-10 md:flex-row md:items-start">
        <div className="md:sticky md:top-10">
          <SwipeablePoster id={movie.id} title={movie.title} posterPath={movie.posterPath} />
          <p className="mt-3 hidden text-center text-xs text-muted md:block">Swipe de poster weg (of ← →) voor een andere film.</p>
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-6 text-center md:text-left">
          <div>
            <h1 className="font-display text-5xl leading-none tracking-wide sm:text-7xl">{movie.title}</h1>
            {movie.originalTitle !== movie.title && <p className="mt-1 text-muted">{movie.originalTitle}</p>}
            {movie.tagline && <p className="mt-3 italic text-muted">“{movie.tagline}”</p>}
          </div>

          <ul className="flex flex-wrap justify-center gap-2 text-sm md:justify-start">
            {movie.year && <li className="rounded-full bg-surface px-3 py-1">{movie.year}</li>}
            {movie.runtime ? <li className="rounded-full bg-surface px-3 py-1">{formatRuntime(movie.runtime)}</li> : null}
            <li className="rounded-full bg-accent px-3 py-1 font-semibold text-bg">★ {movie.rating.toFixed(1)}</li>
            {movie.genres.map((g) => (
              <li key={g} className="rounded-full border border-muted/30 px-3 py-1 text-muted">
                {g}
              </li>
            ))}
          </ul>

          {movie.overview && <p className="max-w-prose leading-relaxed text-fg/90">{movie.overview}</p>}

          {movie.directors.length > 0 && (
            <p className="text-sm">
              <span className="text-muted">Regie: </span>
              <span className="font-medium">{movie.directors.join(", ")}</span>
            </p>
          )}

          <div className="text-left">
            <CastList cast={movie.cast} />
          </div>

          <div className="text-left">
            <Suspense fallback={<WatchProvidersSkeleton />}>
              <WatchProviders id={movie.id} />
            </Suspense>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-start">
            <PickActions currentId={movie.id} />
            <RadarrButton tmdbId={movie.id} />
          </div>

          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted md:justify-start">
            <a href={tmdbMovieUrl(movie.id)} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-fg hover:underline">
              Bekijk op TMDB ↗
            </a>
            {movie.imdbId && (
              <a href={`https://www.imdb.com/title/${movie.imdbId}/`} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-fg hover:underline">
                IMDb ↗
              </a>
            )}
          </p>
          <p className="text-xs text-muted md:hidden">Tip: swipe de poster weg voor een andere film.</p>
        </div>
      </div>
    </main>
  );
}

export function MovieHeroSkeleton() {
  return (
    <main className="theme-surface flex flex-1 items-center">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-12 md:flex-row md:items-start">
        <div className="aspect-[2/3] w-[min(70vw,320px)] animate-pulse rounded-lg bg-surface" />
        <div className="flex w-full flex-col gap-4">
          <div className="h-16 w-3/4 animate-pulse rounded bg-surface" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-surface" />
          <div className="h-32 w-full animate-pulse rounded bg-surface" />
        </div>
      </div>
    </main>
  );
}
