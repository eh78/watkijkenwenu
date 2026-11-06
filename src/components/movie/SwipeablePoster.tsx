"use client";

import { ViewTransition, useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { useNextPick } from "./useNextPick";

interface Props {
  id: number;
  title: string;
  posterPath: string | null;
}

const SWIPE_DISTANCE = 120;
const SWIPE_VELOCITY = 600;

/** Poster die je weg kunt swipen (of → toets) voor de volgende film uit de pool. */
export function SwipeablePoster({ id, title, posterPath }: Props) {
  const goNext = useNextPick(id);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);

  async function flyOut(direction: 1 | -1) {
    await animate(x, direction * 600, { duration: 0.25, ease: "easeIn" });
    goNext();
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      flyOut(info.offset.x > 0 ? 1 : -1);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") flyOut(e.key === "ArrowRight" ? 1 : -1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={onDragEnd}
      style={{ x, rotate, opacity }}
      className="relative w-[min(70vw,320px)] shrink-0 cursor-grab touch-pan-y active:cursor-grabbing"
      aria-label={`Poster van ${title}. Swipe voor een andere film.`}
    >
      <ViewTransition name={`poster-${id}`} share="morph" default="none">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface shadow-[0_0_80px_var(--glow)]">
          {posterPath && (
            <TmdbImage path={posterPath} alt={title} fill sizes="(min-width: 640px) 320px, 70vw" preload draggable={false} className="object-cover" />
          )}
        </div>
      </ViewTransition>
    </motion.div>
  );
}
