"use client";

import { useEffect, useLayoutEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { spin } from "@/app/actions/spin";
import { Button } from "@/components/ui/Button";
import { SettingsLink } from "@/components/ui/SettingsLink";
import { FilmReel } from "@/components/reel/FilmReel";
import { DECADES, getDecade, getGenre, type DecadeId, type GenreId } from "@/lib/constants";
import { consumeRespin, loadPool, savePool } from "@/lib/pool";
import { clearSeen, getSeen, useSeenCount } from "@/lib/seen";
import { posterUrl } from "@/lib/tmdb/images";
import type { MovieSummary } from "@/lib/tmdb/types";
import { DecadeDial } from "./DecadeDial";
import { GenreSelector } from "./GenreSelector";

type Phase =
  | { name: "pick" }
  | { name: "spinning"; pool: MovieSummary[]; winnerId: number; exhausted: boolean };

export function SpinExperience() {
  const router = useRouter();
  const [decadeId, setDecadeId] = useState<DecadeId>("1990");
  const [genreId, setGenreId] = useState<GenreId | null>(null);
  const [phase, setPhase] = useState<Phase>({ name: "pick" });
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const seenCount = useSeenCount();

  const theme = getDecade(decadeId)?.theme ?? DECADES[0].theme;

  function runSpin(decade: DecadeId, genre: GenreId) {
    startLoading(async () => {
      setError(null);
      setDecadeId(decade);
      setGenreId(genre);
      const result = await spin(decade, genre, getSeen());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const winner = result.pool.find((m) => m.id === result.winnerId);
      // Tijdens het draaien alvast de resultaatpagina en de hi-res poster ophalen,
      // zodat de poster-morph direct kan afspelen.
      router.prefetch(`/film/${result.winnerId}`);
      if (winner?.posterPath) new window.Image().src = posterUrl(winner.posterPath, "w780");

      savePool({ decadeId: decade, genreId: genre, movies: result.pool });
      setPhase({ name: "spinning", pool: result.pool, winnerId: result.winnerId, exhausted: result.exhausted });
    });
  }

  function onSpin() {
    if (genreId) runSpin(decadeId, genreId);
  }

  // Next.js bewaart deze pagina (verborgen) bij wegnavigeren. Zet de filmrol terug
  // naar het keuzescherm zodra de pagina verborgen wordt, anders speelt bij
  // terugkeer de vorige spin opnieuw af en komt dezelfde film eruit.
  useLayoutEffect(() => {
    return () => setPhase({ name: "pick" });
  }, []);

  // "Opnieuw draaien" op de resultaatpagina: direct een nieuwe spin met dezelfde keuze.
  useEffect(() => {
    if (!consumeRespin()) return;
    const last = loadPool();
    if (last && getDecade(last.decadeId) && getGenre(last.genreId)) {
      runSpin(last.decadeId as DecadeId, last.genreId as GenreId);
    }
    // runSpin hoeft geen dependency te zijn: dit moet alleen bij (her)tonen draaien.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onLanded(winner: MovieSummary) {
    router.push(`/film/${winner.id}`);
  }

  return (
    <main data-theme={theme} className="theme-surface flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden px-4 py-12">
      <SettingsLink className="absolute right-4 top-4 sm:right-6 sm:top-6" />
      <header className="text-center">
        <h1 className="font-display text-6xl tracking-wide text-fg drop-shadow-[0_0_24px_var(--glow)] sm:text-8xl">
          Wat kijken we nu?
        </h1>
        <p className="mt-2 text-muted">
          {phase.name === "pick"
            ? "Kies een decennium en een genre. De filmrol doet de rest."
            : phase.exhausted
              ? "Je hebt alle topfilms in deze combinatie al gezien, dus dit kan een herhaling zijn."
              : `De beste ${getGenre(genreId!)?.label.toLowerCase()} uit de jaren ${getDecade(decadeId)?.label}…`}
        </p>
      </header>

      <AnimatePresence mode="wait">
        {phase.name === "pick" ? (
          <motion.section
            key="pick"
            className="flex w-full flex-col items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
          >
            <DecadeDial value={decadeId} onChange={setDecadeId} />
            <GenreSelector value={genreId} onChange={setGenreId} />
            <Button onClick={onSpin} disabled={!genreId || loading} aria-busy={loading}>
              {loading ? "Filmrol laden…" : "Draai de filmrol"}
            </Button>
            {seenCount > 0 && (
              <p className="text-sm text-muted">
                {seenCount === 1 ? "1 film" : `${seenCount} films`} al gezien, die slaan we over.{" "}
                <button onClick={clearSeen} className="underline underline-offset-2 hover:text-fg">
                  Wissen
                </button>
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-accent-2">
                {error}
              </p>
            )}
          </motion.section>
        ) : (
          <motion.section key="reel" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FilmReel pool={phase.pool} winnerId={phase.winnerId} onLanded={onLanded} />
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
