"use client";

import { ViewTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "motion/react";
import type { MovieSummary } from "@/lib/tmdb/types";
import { PosterCard } from "./PosterCard";

interface Props {
  pool: MovieSummary[];
  winnerId: number;
  /** Wordt aangeroepen zodra de rol stilstaat en de winnaar is uitgelicht. */
  onLanded: (winner: MovieSummary) => void;
}

const GAP = 16;
/** Minimaal aantal kaarten in de strip, zodat de rol lang genoeg "doorraast". */
const MIN_CARDS = 48;
const SPIN_SECONDS = 4.8;

/**
 * "De Filmrol": een 35mm-strip met posters die voorbijvliegt, afremt met een
 * kleine doorschiet-terugklik en stopt op de winnaar in een spotlight.
 * Alleen `transform`/`opacity`/`filter` worden geanimeerd (GPU-vriendelijk).
 */
export function FilmReel({ pool, winnerId, onLanded }: Props) {
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  // De rol wordt pas na een klik gemount (nooit server-side), dus window is beschikbaar.
  const [cardWidth] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches ? 200 : 140,
  );
  const [landed, setLanded] = useState(false);

  const x = useMotionValue(0);
  const velocity = useVelocity(x);
  // Hoe sneller de rol, hoe meer "motion blur" en schuin trekken.
  const skew = useTransform(velocity, [-9000, 0, 9000], [10, 0, -10], { clamp: true });
  const blurPx = useTransform(velocity, [-9000, 0, 9000], [5, 0, 5], { clamp: true });
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  const winnerIndex = Math.max(0, pool.findIndex((m) => m.id === winnerId));
  const laps = Math.max(3, Math.ceil(MIN_CARDS / pool.length));
  const targetIndex = (laps - 1) * pool.length + winnerIndex;
  const strip = useMemo(
    () => Array.from({ length: laps * pool.length }, (_, i) => pool[i % pool.length]),
    [laps, pool],
  );

  // De spin zelf.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const step = cardWidth + GAP;
    const center = viewport.clientWidth / 2 - cardWidth / 2;
    const start = center;
    const target = center - targetIndex * step;
    const overshoot = step * 0.35;

    x.set(start);
    const controls = reduceMotion
      ? animate(x, target, { duration: 0.5, ease: "easeOut" })
      : animate(x, [start, target - overshoot, target], {
          duration: SPIN_SECONDS,
          times: [0, 0.88, 1],
          ease: [
            [0.12, 0.75, 0.25, 1],
            [0.3, 0, 0.2, 1],
          ],
        });

    let timer: ReturnType<typeof setTimeout>;
    controls.then(() => {
      setLanded(true);
      navigator.vibrate?.(30);
      timer = setTimeout(() => onLanded(pool[winnerIndex]), reduceMotion ? 300 : 1100);
    });

    return () => {
      controls.stop();
      clearTimeout(timer);
    };
    // onLanded bewust niet als dependency: de spin mag niet herstarten bij een re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardWidth, targetIndex, reduceMotion, x]);

  return (
    <div className="relative w-full">
      {/* Spotlight vanaf boven, flikkert aan als de rol stopt */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-40%] z-20 h-[180%] w-[min(420px,80vw)] -translate-x-1/2"
        style={{ background: "radial-gradient(ellipse 50% 60% at 50% 40%, var(--glow), transparent 70%)" }}
        initial={{ opacity: 0 }}
        animate={landed ? { opacity: [0, 1, 0.4, 1, 0.7, 1] } : { opacity: 0.25 }}
        transition={{ duration: landed ? 0.7 : 0.3, times: landed ? [0, 0.15, 0.3, 0.5, 0.7, 1] : undefined }}
      />

      <div
        ref={viewportRef}
        className="sprockets relative overflow-hidden py-8"
        style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}
        aria-live="polite"
        aria-label={landed ? `Gekozen: ${pool[winnerIndex].title}` : "De filmrol draait…"}
      >
        <motion.ul className="flex will-change-transform" style={{ x, skewX: skew, filter, gap: GAP }}>
          {strip.map((movie, i) => {
            const isWinner = i === targetIndex;
            const card = (
              <PosterCard movie={movie} width={cardWidth} highlighted={landed && isWinner} dimmed={landed && !isWinner} />
            );
            return (
              <li key={i} className="shrink-0">
                {isWinner ? (
                  <ViewTransition name={`poster-${movie.id}`} share="morph" default="none">
                    {card}
                  </ViewTransition>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </motion.ul>
      </div>
    </div>
  );
}
