import Link from "next/link";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { themeForYear } from "@/lib/theme";
import type { MovieDetails } from "@/lib/tmdb/types";
import { MarkSeen } from "./MarkSeen";
import { PickActions } from "./PickActions";
import { SwipeablePoster } from "./SwipeablePoster";

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
        <Link href="/" className="font-display text-2xl tracking-wide text-fg/80 hover:text-fg">
          Wat kijken we nu?
        </Link>
      </nav>
      {movie.backdropPath && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <TmdbImage path={movie.backdropPath} kind="backdrop" alt="" fill sizes="100vw" className="scale-110 object-cover opacity-30 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-6 py-10 md:flex-row md:items-center">
        <SwipeablePoster id={movie.id} title={movie.title} posterPath={movie.posterPath} />

        <div className="flex flex-col gap-5 text-center md:text-left">
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

          {/* v2: <WatchProviders id={movie.id} /> (streamen/huren/kopen in NL) en <AddToRadarr tmdbId={movie.id} /> */}

          <PickActions currentId={movie.id} />
          <p className="text-xs text-muted">Tip: swipe de poster weg (of gebruik ← →) voor een andere film.</p>
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
